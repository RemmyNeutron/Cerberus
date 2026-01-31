import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tier: text("tier").notNull(), // 'basic', 'pro', 'enterprise'
  priceMonthly: integer("price_monthly").notNull(),
  priceYearly: integer("price_yearly").notNull(),
  features: text("features").array().notNull(),
  maxDevices: integer("max_devices").notNull(),
  isPopular: boolean("is_popular").default(false),
});

// User Subscriptions - unique constraint on userId to prevent race conditions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(), // Unique constraint prevents duplicate subscriptions
  planId: varchar("plan_id").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'cancelled', 'expired'
  billingCycle: text("billing_cycle").notNull().default("monthly"), // 'monthly', 'yearly'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Threat Logs (for demonstrating the security features)
export const threatLogs = pgTable("threat_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  headType: text("head_type").notNull(), // 'deepfake', 'surveillance', 'containment'
  threatLevel: text("threat_level").notNull(), // 'low', 'medium', 'high', 'critical'
  description: text("description").notNull(),
  status: text("status").notNull().default("detected"), // 'detected', 'blocked', 'resolved'
  // Enhanced threat details
  source: text("source"), // Where the threat originated (e.g., "discord.com", "unknown-tracker.xyz")
  sourceType: text("source_type"), // 'website', 'email', 'application', 'network', 'file'
  blockedContent: text("blocked_content"), // What was blocked (e.g., "Synthetic voice call", "Tracking pixel")
  reason: text("reason"), // Why it was blocked (e.g., "AI voice patterns detected", "Known tracker fingerprint")
  ipAddress: text("ip_address"), // Source IP if applicable
  actionTaken: text("action_taken"), // What action was taken (e.g., "Connection terminated", "Content quarantined")
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Protection Status (real-time status for each head)
export const protectionStatus = pgTable("protection_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deepfakeEnabled: boolean("deepfake_enabled").default(true),
  surveillanceEnabled: boolean("surveillance_enabled").default(true),
  containmentEnabled: boolean("containment_enabled").default(true),
  lastScanAt: timestamp("last_scan_at").defaultNow(),
  threatsBlockedToday: integer("threats_blocked_today").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
});
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
});
export const insertThreatLogSchema = createInsertSchema(threatLogs).omit({
  id: true,
  detectedAt: true,
});
export const insertProtectionStatusSchema = createInsertSchema(protectionStatus).omit({
  id: true,
  updatedAt: true,
});

// Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type ThreatLog = typeof threatLogs.$inferSelect;
export type InsertThreatLog = z.infer<typeof insertThreatLogSchema>;
export type ProtectionStatus = typeof protectionStatus.$inferSelect;
export type InsertProtectionStatus = z.infer<typeof insertProtectionStatusSchema>;
