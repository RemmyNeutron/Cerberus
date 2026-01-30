import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedDatabase, createUserDefaults } from "./seed";
import { 
  authRateLimiter, 
  sensitiveRateLimiter, 
  sanitizeString,
  logSecurityEvent,
  uuidSchema,
  generateCsrfToken,
  validateCsrfToken,
} from "./security";

// ============ CSRF TOKEN VALIDATION (Mandatory for State-Changing Requests) ============

// CSRF token validation middleware - enforces token for state-changing requests
function enforceCsrfValidation(req: any, res: Response, next: NextFunction) {
  // Get token from header (X-CSRF-Token)
  const csrfToken = req.headers["x-csrf-token"];
  const sessionId = req.sessionID || req.authenticatedUserId;
  
  if (!sessionId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Require CSRF token for authenticated state-changing requests
  if (!csrfToken) {
    logSecurityEvent({
      type: "csrf_token_missing",
      userId: req.authenticatedUserId,
      ip: getClientIp(req),
      path: req.path,
      method: req.method,
    });
    return res.status(403).json({ message: "CSRF token required" });
  }
  
  // Validate the token
  if (!validateCsrfToken(csrfToken, sessionId)) {
    logSecurityEvent({
      type: "csrf_token_invalid",
      userId: req.authenticatedUserId,
      ip: getClientIp(req),
      path: req.path,
      method: req.method,
    });
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  
  next();
}

// ============ VALIDATION SCHEMAS ============

// Strict validation with length limits to prevent DoS
const updateProtectionSchema = z.object({
  headType: z.enum(["deepfake", "surveillance", "containment"]),
  enabled: z.boolean(),
});

const createSubscriptionSchema = z.object({
  planId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/, "Invalid plan ID format"),
  billingCycle: z.enum(["monthly", "yearly"]),
});

const updateSubscriptionSchema = z.object({
  status: z.enum(["active", "cancelled", "expired"]).optional(),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
});

const createThreatLogSchema = z.object({
  headType: z.enum(["deepfake", "surveillance", "containment"]),
  threatLevel: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(1).max(1000).transform(sanitizeString), // Sanitize input
  status: z.enum(["detected", "blocked", "resolved"]).optional(),
});

const updateThreatLogSchema = z.object({
  status: z.enum(["detected", "blocked", "resolved"]),
});

// ID parameter validation (IDOR prevention)
const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// ============ HELPER FUNCTIONS ============

// Type-safe user ID extraction with validation
function getUserId(req: any): string | null {
  const userId = req.user?.claims?.sub;
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

// Get client IP for security logging
function getClientIp(req: Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || 
         req.socket.remoteAddress || 
         "unknown";
}

// ============ AUTHORIZATION MIDDLEWARE ============

// Verify user is authenticated and extract userId safely
function requireAuth(req: any, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (!userId) {
    logSecurityEvent({
      type: "unauthorized_access",
      ip: getClientIp(req),
      path: req.path,
      method: req.method,
    });
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.authenticatedUserId = userId;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (must be before other routes)
  await setupAuth(app);
  
  // Apply rate limiting to auth routes
  app.use("/api/login", authRateLimiter);
  app.use("/api/callback", authRateLimiter);
  
  registerAuthRoutes(app);

  // Seed database with default data
  await seedDatabase();

  // ============ CSRF TOKEN ENDPOINT ============

  // Get CSRF token for authenticated sessions
  app.get("/api/csrf-token", isAuthenticated, requireAuth, async (req: any, res) => {
    try {
      const sessionId = req.sessionID || req.authenticatedUserId;
      const token = generateCsrfToken(sessionId);
      res.json({ csrfToken: token });
    } catch (error) {
      console.error("Error generating CSRF token:", error);
      res.status(500).json({ message: "Failed to generate CSRF token" });
    }
  });

  // ============ SUBSCRIPTION PLANS (Public) ============

  // Get subscription plans (public route - read-only, safe)
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      // Only return safe, public fields
      const safePlans = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        tier: plan.tier,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        features: plan.features,
        isPopular: plan.isPopular,
      }));
      res.json(safePlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // ============ USER SUBSCRIPTIONS ============

  // Get user subscription
  app.get("/api/subscription", isAuthenticated, requireAuth, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription || null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Create user subscription (rate limited for sensitive operations)
  app.post("/api/subscription", isAuthenticated, requireAuth, enforceCsrfValidation, sensitiveRateLimiter, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      
      const validation = createSubscriptionSchema.safeParse(req.body);
      if (!validation.success) {
        logSecurityEvent({
          type: "invalid_input",
          userId,
          ip: getClientIp(req),
          path: req.path,
          method: req.method,
          details: { errors: validation.error.errors },
        });
        return res.status(400).json({ message: "Invalid request body" });
      }

      const { planId, billingCycle } = validation.data;
      
      // Verify plan exists (prevents injection of arbitrary plan IDs)
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      
      // Atomic subscription creation with unique constraint handling
      // The database unique constraint on userId prevents race conditions
      try {
        const subscription = await storage.createUserSubscription({
          userId,
          planId,
          billingCycle,
          status: "active",
        });
        
        logSecurityEvent({
          type: "subscription_created",
          userId,
          ip: getClientIp(req),
          path: req.path,
          method: req.method,
          details: { planId, billingCycle },
        });
        
        res.status(201).json(subscription);
      } catch (dbError: any) {
        // Handle unique constraint violation (race condition protection)
        if (dbError.code === "23505" || dbError.message?.includes("unique")) {
          return res.status(409).json({ message: "User already has a subscription" });
        }
        throw dbError;
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Update user subscription
  app.patch("/api/subscription", isAuthenticated, requireAuth, enforceCsrfValidation, sensitiveRateLimiter, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      
      const validation = updateSubscriptionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      // Get subscription and verify ownership (IDOR prevention)
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No subscription found" });
      }

      // Ensure the subscription belongs to the authenticated user
      if (subscription.userId !== userId) {
        logSecurityEvent({
          type: "idor_attempt",
          userId,
          ip: getClientIp(req),
          path: req.path,
          method: req.method,
          details: { targetSubscriptionId: subscription.id },
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateUserSubscription(subscription.id, validation.data);
      
      logSecurityEvent({
        type: "subscription_updated",
        userId,
        ip: getClientIp(req),
        path: req.path,
        method: req.method,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Cancel subscription
  app.delete("/api/subscription", isAuthenticated, requireAuth, enforceCsrfValidation, sensitiveRateLimiter, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No subscription found" });
      }

      // Verify ownership (IDOR prevention)
      if (subscription.userId !== userId) {
        logSecurityEvent({
          type: "idor_attempt",
          userId,
          ip: getClientIp(req),
          path: req.path,
          method: req.method,
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateUserSubscription(subscription.id, { status: "cancelled" });
      
      logSecurityEvent({
        type: "subscription_cancelled",
        userId,
        ip: getClientIp(req),
        path: req.path,
        method: req.method,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // ============ PROTECTION STATUS ============

  // Get user's protection status
  app.get("/api/protection-status", isAuthenticated, requireAuth, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      
      // Ensure user has defaults
      await createUserDefaults(userId);
      
      let status = await storage.getProtectionStatus(userId);
      
      if (!status) {
        status = await storage.createProtectionStatus({
          userId,
          deepfakeEnabled: true,
          surveillanceEnabled: true,
          containmentEnabled: true,
          threatsBlockedToday: 0,
        });
      }
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching protection status:", error);
      res.status(500).json({ message: "Failed to fetch protection status" });
    }
  });

  // Update protection status
  app.patch("/api/protection-status", isAuthenticated, requireAuth, enforceCsrfValidation, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      
      const validation = updateProtectionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const { headType, enabled } = validation.data;

      const updateData: any = {};
      if (headType === "deepfake") updateData.deepfakeEnabled = enabled;
      if (headType === "surveillance") updateData.surveillanceEnabled = enabled;
      if (headType === "containment") updateData.containmentEnabled = enabled;

      // updateProtectionStatus already filters by userId (IDOR safe)
      const status = await storage.updateProtectionStatus(userId, updateData);
      
      if (!status) {
        return res.status(404).json({ message: "Protection status not found" });
      }
      
      res.json(status);
    } catch (error) {
      console.error("Error updating protection status:", error);
      res.status(500).json({ message: "Failed to update protection status" });
    }
  });

  // ============ THREAT LOGS ============

  // Get threat logs
  app.get("/api/threat-logs", isAuthenticated, requireAuth, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      // getThreatLogs already filters by userId (IDOR safe)
      const logs = await storage.getThreatLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching threat logs:", error);
      res.status(500).json({ message: "Failed to fetch threat logs" });
    }
  });

  // Create threat log
  app.post("/api/threat-logs", isAuthenticated, requireAuth, enforceCsrfValidation, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      
      const validation = createThreatLogSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const log = await storage.createThreatLog({
        userId,
        ...validation.data,
        status: validation.data.status || "detected",
      });
      
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating threat log:", error);
      res.status(500).json({ message: "Failed to create threat log" });
    }
  });

  // Update threat log status (IDOR protected)
  app.patch("/api/threat-logs/:id", isAuthenticated, requireAuth, enforceCsrfValidation, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      
      // Validate ID parameter to prevent injection
      const paramValidation = idParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        logSecurityEvent({
          type: "invalid_id_parameter",
          userId,
          ip: getClientIp(req),
          path: req.path,
          method: req.method,
        });
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const { id } = paramValidation.data;
      
      const validation = updateThreatLogSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      // Update with ownership check (IDOR protection)
      const log = await storage.updateThreatLogStatus(id, userId, validation.data.status);
      
      if (!log) {
        // Log potential IDOR attempt (could be legitimate 404 or attack)
        logSecurityEvent({
          type: "resource_not_found_or_idor",
          userId,
          ip: getClientIp(req),
          path: req.path,
          method: req.method,
          details: { targetId: id },
        });
        return res.status(404).json({ message: "Threat log not found" });
      }
      
      res.json(log);
    } catch (error) {
      console.error("Error updating threat log:", error);
      res.status(500).json({ message: "Failed to update threat log" });
    }
  });

  // ============ STATS ============

  // Get stats
  app.get("/api/stats", isAuthenticated, requireAuth, async (req: any, res) => {
    try {
      const userId = req.authenticatedUserId;
      // All queries filter by userId (IDOR safe)
      const logs = await storage.getThreatLogs(userId);
      const status = await storage.getProtectionStatus(userId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const threatsToday = logs.filter(log => {
        const logDate = new Date(log.detectedAt || 0);
        return logDate >= today;
      }).length;

      const totalThreatsBlocked = logs.filter(log => log.status === "blocked" || log.status === "resolved").length;

      res.json({
        totalThreatsBlocked,
        threatsToday,
        lastScan: "Just now",
        securityScore: 98,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
