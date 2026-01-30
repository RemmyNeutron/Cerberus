import { db } from "./db";
import { subscriptionPlans, threatLogs, protectionStatus } from "@shared/schema";
import { sql } from "drizzle-orm";

const defaultPlans = [
  {
    name: "Basic",
    tier: "basic",
    priceMonthly: 9,
    priceYearly: 89,
    features: [
      "AI Deepfake Detection (Limited)",
      "Basic Surveillance Monitoring",
      "Email Threat Alerts",
      "Community Support",
    ],
    maxDevices: 3,
    isPopular: false,
  },
  {
    name: "Pro",
    tier: "pro",
    priceMonthly: 29,
    priceYearly: 279,
    features: [
      "Full AI Deepfake Detection",
      "Advanced Surveillance Monitoring",
      "Real-time Threat Alerts",
      "Priority Support",
      "Adaptive Threat Containment",
      "Real-time Response",
    ],
    maxDevices: 10,
    isPopular: true,
  },
  {
    name: "Enterprise",
    tier: "enterprise",
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      "Full AI Deepfake Detection",
      "Enterprise Surveillance Suite",
      "Custom Alert Configuration",
      "24/7 Dedicated Support",
      "Advanced Threat Containment",
      "Instant Real-time Response",
      "Full API Access",
      "Dedicated Account Manager",
    ],
    maxDevices: 100,
    isPopular: false,
  },
];

export async function seedDatabase() {
  try {
    // Check if plans already exist
    const existingPlans = await db.select().from(subscriptionPlans);
    
    if (existingPlans.length === 0) {
      console.log("Seeding subscription plans...");
      await db.insert(subscriptionPlans).values(defaultPlans);
      console.log("Subscription plans seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function createUserDefaults(userId: string) {
  try {
    // Check if user has protection status
    const existingStatus = await db.select().from(protectionStatus).where(sql`${protectionStatus.userId} = ${userId}`);
    
    if (existingStatus.length === 0) {
      // Create default protection status
      await db.insert(protectionStatus).values({
        userId,
        deepfakeEnabled: true,
        surveillanceEnabled: true,
        containmentEnabled: true,
        threatsBlockedToday: 0,
      });

      // Create some sample threat logs for demo purposes
      const sampleThreats = [
        {
          userId,
          headType: "deepfake",
          threatLevel: "medium",
          description: "Potential deepfake video detected in incoming email attachment",
          status: "blocked",
        },
        {
          userId,
          headType: "surveillance",
          threatLevel: "low",
          description: "Third-party tracker blocked on visited website",
          status: "blocked",
        },
        {
          userId,
          headType: "containment",
          threatLevel: "high",
          description: "Suspicious network activity contained and isolated",
          status: "resolved",
        },
        {
          userId,
          headType: "deepfake",
          threatLevel: "low",
          description: "AI-generated image detected in social media feed",
          status: "blocked",
        },
        {
          userId,
          headType: "surveillance",
          threatLevel: "medium",
          description: "Facial recognition attempt blocked from unknown source",
          status: "blocked",
        },
      ];

      await db.insert(threatLogs).values(sampleThreats);
    }
  } catch (error) {
    console.error("Error creating user defaults:", error);
  }
}
