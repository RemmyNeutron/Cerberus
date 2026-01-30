import { 
  subscriptionPlans,
  userSubscriptions,
  threatLogs,
  protectionStatus,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type UserSubscription,
  type InsertUserSubscription,
  type ThreatLog,
  type InsertThreatLog,
  type ProtectionStatus,
  type InsertProtectionStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // User Subscriptions
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  
  // Threat Logs - with ownership verification
  getThreatLogs(userId: string): Promise<ThreatLog[]>;
  getThreatLogById(id: string): Promise<ThreatLog | undefined>;
  getThreatLogByIdAndUser(id: string, userId: string): Promise<ThreatLog | undefined>;
  createThreatLog(log: InsertThreatLog): Promise<ThreatLog>;
  updateThreatLogStatus(id: string, userId: string, status: string): Promise<ThreatLog | undefined>;
  
  // Protection Status
  getProtectionStatus(userId: string): Promise<ProtectionStatus | undefined>;
  createProtectionStatus(status: InsertProtectionStatus): Promise<ProtectionStatus>;
  updateProtectionStatus(userId: string, data: Partial<InsertProtectionStatus>): Promise<ProtectionStatus | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans);
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db.insert(subscriptionPlans).values(plan).returning();
    return created;
  }

  // User Subscriptions
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId));
    return subscription;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [created] = await db.insert(userSubscriptions).values(subscription).returning();
    return created;
  }

  async updateUserSubscription(id: string, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [updated] = await db.update(userSubscriptions).set(data).where(eq(userSubscriptions.id, id)).returning();
    return updated;
  }

  // Threat Logs - with ownership verification to prevent IDOR
  async getThreatLogs(userId: string): Promise<ThreatLog[]> {
    return db.select().from(threatLogs).where(eq(threatLogs.userId, userId)).orderBy(desc(threatLogs.detectedAt));
  }

  async getThreatLogById(id: string): Promise<ThreatLog | undefined> {
    const [log] = await db.select().from(threatLogs).where(eq(threatLogs.id, id));
    return log;
  }

  // IDOR Protection: Get threat log only if it belongs to the user
  async getThreatLogByIdAndUser(id: string, userId: string): Promise<ThreatLog | undefined> {
    const [log] = await db.select().from(threatLogs).where(
      and(eq(threatLogs.id, id), eq(threatLogs.userId, userId))
    );
    return log;
  }

  async createThreatLog(log: InsertThreatLog): Promise<ThreatLog> {
    const [created] = await db.insert(threatLogs).values(log).returning();
    return created;
  }

  // IDOR Protection: Update only if log belongs to user
  async updateThreatLogStatus(id: string, userId: string, status: string): Promise<ThreatLog | undefined> {
    const [updated] = await db.update(threatLogs)
      .set({ status, resolvedAt: status === "resolved" ? new Date() : null })
      .where(and(eq(threatLogs.id, id), eq(threatLogs.userId, userId)))
      .returning();
    return updated;
  }

  // Protection Status
  async getProtectionStatus(userId: string): Promise<ProtectionStatus | undefined> {
    const [status] = await db.select().from(protectionStatus).where(eq(protectionStatus.userId, userId));
    return status;
  }

  async createProtectionStatus(status: InsertProtectionStatus): Promise<ProtectionStatus> {
    const [created] = await db.insert(protectionStatus).values(status).returning();
    return created;
  }

  async updateProtectionStatus(userId: string, data: Partial<InsertProtectionStatus>): Promise<ProtectionStatus | undefined> {
    const [updated] = await db.update(protectionStatus).set({ ...data, updatedAt: new Date() }).where(eq(protectionStatus.userId, userId)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
