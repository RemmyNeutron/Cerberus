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

      // Create some sample threat logs for demo purposes with detailed information
      const sampleThreats = [
        {
          userId,
          headType: "deepfake",
          threatLevel: "medium",
          description: "Potential deepfake video detected in incoming email attachment",
          status: "blocked",
          source: "suspicious-sender@mail-spoof.net",
          sourceType: "email",
          blockedContent: "Video attachment (meeting_recording.mp4)",
          reason: "AI voice synthesis patterns detected with 87% confidence. Lip-sync inconsistencies identified.",
          ipAddress: "185.234.72.19",
          actionTaken: "Attachment quarantined and sender flagged",
        },
        {
          userId,
          headType: "surveillance",
          threatLevel: "low",
          description: "Third-party tracker blocked on visited website",
          status: "blocked",
          source: "tracker.adnetwork-xyz.com",
          sourceType: "website",
          blockedContent: "Cross-site tracking pixel",
          reason: "Known fingerprinting tracker attempting to collect browser data and browsing history.",
          ipAddress: "104.21.45.67",
          actionTaken: "Connection blocked, request nullified",
        },
        {
          userId,
          headType: "containment",
          threatLevel: "high",
          description: "Suspicious network activity contained and isolated",
          status: "resolved",
          source: "unknown-service.local:4433",
          sourceType: "network",
          blockedContent: "Outbound data exfiltration attempt",
          reason: "Unusual outbound traffic pattern detected. Application attempting to send encrypted data to unknown server.",
          ipAddress: "192.168.1.105 → 91.234.56.78",
          actionTaken: "Process sandboxed, network connection terminated",
        },
        {
          userId,
          headType: "deepfake",
          threatLevel: "low",
          description: "AI-generated image detected in social media feed",
          status: "blocked",
          source: "twitter.com/suspicious_account",
          sourceType: "website",
          blockedContent: "Profile image (synthetic face)",
          reason: "GAN-generated face detected. Symmetric lighting artifacts and unnatural skin texture patterns identified.",
          ipAddress: null,
          actionTaken: "Image flagged with AI warning overlay",
        },
        {
          userId,
          headType: "surveillance",
          threatLevel: "medium",
          description: "Facial recognition attempt blocked from unknown source",
          status: "blocked",
          source: "cdn.facial-analytics.io",
          sourceType: "application",
          blockedContent: "Webcam access request with facial mapping",
          reason: "Unauthorized facial biometric collection attempt. App requested camera access with hidden analytics payload.",
          ipAddress: "172.67.182.91",
          actionTaken: "Camera access denied, analytics script blocked",
        },
        {
          userId,
          headType: "containment",
          threatLevel: "critical",
          description: "Malicious script injection attempt neutralized",
          status: "blocked",
          source: "compromised-plugin.js",
          sourceType: "file",
          blockedContent: "Browser extension payload",
          reason: "Detected obfuscated JavaScript attempting to inject keylogger and credential harvesting code.",
          ipAddress: "45.89.127.203",
          actionTaken: "Script execution halted, extension quarantined",
        },
        {
          userId,
          headType: "deepfake",
          threatLevel: "high",
          description: "Synthetic voice detected in incoming call",
          status: "blocked",
          source: "+1 (555) 0123-4567",
          sourceType: "application",
          blockedContent: "VoIP call (voice clone attempt)",
          reason: "Real-time voice synthesis detected. Call audio patterns match known AI TTS models with 94% confidence.",
          ipAddress: "203.0.113.42",
          actionTaken: "Call terminated, caller ID flagged as spoofed",
        },
      ];

      await db.insert(threatLogs).values(sampleThreats);
    }
  } catch (error) {
    console.error("Error creating user defaults:", error);
  }
}
