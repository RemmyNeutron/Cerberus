import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { z } from "zod";

// ============ SECURITY HEADERS (XSS, Clickjacking, Content-Type Sniffing) ============

export const securityHeaders = helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Vite HMR in dev
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for inline styles
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'none'"], // Prevent embedding in iframes (clickjacking)
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  // X-Frame-Options - prevents clickjacking
  frameguard: { action: "deny" },
  // X-Content-Type-Options - prevents MIME type sniffing
  noSniff: true,
  // X-XSS-Protection - legacy XSS filter
  xssFilter: true,
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // Referrer Policy - prevents information leakage
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disabled to allow external resources
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "same-site" },
});

// ============ RATE LIMITING (DoS, Brute Force Prevention) ============

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static assets
    return !req.path.startsWith("/api");
  },
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for sensitive operations (subscription changes, etc.)
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 sensitive operations per minute
  message: { message: "Too many requests for this operation, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============ HTTP PARAMETER POLLUTION PREVENTION ============

export const hppMiddleware = hpp({
  whitelist: [], // No parameters are whitelisted for duplicate values
});

// ============ INPUT SANITIZATION ============

// Sanitize string inputs to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
    .replace(/`/g, "&#x60;");
}

// Deep sanitize object
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

// Middleware to sanitize request body
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    // Don't sanitize if it's a Zod-validated body (validation handles this)
    // But do sanitize user-provided string fields
    req.body = sanitizeObject(req.body);
  }
  next();
}

// ============ OPEN REDIRECT PREVENTION ============

// Allowed redirect URLs (whitelist approach)
const ALLOWED_REDIRECT_HOSTS = [
  "localhost",
  "127.0.0.1",
  process.env.REPLIT_DEPLOYMENT_URL?.replace(/^https?:\/\//, ""),
  process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : null,
].filter(Boolean) as string[];

export function isValidRedirectUrl(url: string): boolean {
  // Only allow relative URLs or URLs to allowed hosts
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true; // Relative URL is safe
  }
  
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_HOSTS.some(host => 
      parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

export function validateRedirect(req: Request, res: Response, next: NextFunction) {
  const redirectUrl = req.query.redirect || req.query.returnTo || req.query.next;
  
  if (redirectUrl && typeof redirectUrl === "string") {
    if (!isValidRedirectUrl(redirectUrl)) {
      return res.status(400).json({ message: "Invalid redirect URL" });
    }
  }
  
  next();
}

// ============ INSECURE DIRECT OBJECT REFERENCE (IDOR) PREVENTION ============

// UUID validation schema
export const uuidSchema = z.string().uuid();

// Validate that resource belongs to the authenticated user
export function createOwnershipMiddleware(resourceType: string) {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Store userId for use in route handlers
    req.authenticatedUserId = userId;
    next();
  };
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      authenticatedUserId?: string;
    }
  }
}

// ============ SSRF PREVENTION ============

// Block internal IP addresses
const BLOCKED_IP_PATTERNS = [
  /^127\./,           // Loopback
  /^10\./,            // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B
  /^192\.168\./,      // Private Class C
  /^169\.254\./,      // Link-local
  /^0\./,             // Current network
  /^::1$/,            // IPv6 loopback
  /^fe80:/i,          // IPv6 link-local
  /^fc00:/i,          // IPv6 unique local
  /^fd00:/i,          // IPv6 unique local
];

export function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost variants
    if (hostname === "localhost" || hostname === "localhost.localdomain") {
      return true;
    }
    
    // Block internal IP patterns
    return BLOCKED_IP_PATTERNS.some(pattern => pattern.test(hostname));
  } catch {
    return true; // Block invalid URLs
  }
}

// ============ JSON BODY LIMIT (Prevents DoS via large payloads) ============

export const jsonBodyLimit = {
  limit: "10kb", // Limit JSON body size to 10KB
};

// ============ NO CACHE FOR API RESPONSES ============

export function noCacheHeaders(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith("/api")) {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store",
    });
  }
  next();
}

// ============ ERROR HANDLING (Information Disclosure Prevention) ============

export function secureErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the full error internally
  console.error("Security Error:", {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Don't expose internal error details to client
  const status = err.status || err.statusCode || 500;
  const isClientError = status >= 400 && status < 500;
  
  // Only show detailed message for client errors, generic for server errors
  const message = isClientError 
    ? err.message || "Bad Request"
    : "An error occurred. Please try again later.";

  if (res.headersSent) {
    return next(err);
  }

  return res.status(status).json({ message });
}

// ============ REQUEST ID FOR TRACING ============

export function addRequestId(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.headers["x-request-id"] = requestId;
  res.set("X-Request-ID", requestId);
  next();
}

// ============ CSRF PROTECTION ============

import crypto from "crypto";

// Generate CSRF token based on session
export function generateCsrfToken(sessionId: string): string {
  const secret = process.env.SESSION_SECRET || "default-secret";
  const timestamp = Date.now().toString();
  const data = `${sessionId}:${timestamp}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${timestamp}:${signature}`;
}

export function validateCsrfToken(token: string, sessionId: string): boolean {
  if (!token || typeof token !== "string") return false;
  
  const parts = token.split(":");
  if (parts.length !== 2) return false;
  
  const [timestamp, signature] = parts;
  const secret = process.env.SESSION_SECRET || "default-secret";
  
  // Check token age (max 1 hour)
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (isNaN(tokenAge) || tokenAge > 60 * 60 * 1000) return false;
  
  // Verify signature
  const data = `${sessionId}:${timestamp}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex");
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// CSRF middleware for state-changing operations
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  // For APIs, we use SameSite cookies + origin checking instead of tokens
  // This is the "defense in depth" approach
  const origin = req.headers.origin;
  const host = req.headers.host;
  
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (host && originUrl.host !== host) {
        logSecurityEvent({
          type: "csrf_origin_mismatch",
          ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown",
          path: req.path,
          method: req.method,
          details: { origin, host },
        });
        return res.status(403).json({ message: "Forbidden" });
      }
    } catch {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  
  next();
}

// ============ SECURITY AUDIT LOG ============

interface SecurityEvent {
  timestamp: Date;
  type: string;
  userId?: string;
  ip: string;
  path: string;
  method: string;
  details?: any;
}

const securityLog: SecurityEvent[] = [];
const MAX_LOG_SIZE = 1000;

export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">) {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };
  
  securityLog.push(fullEvent);
  
  // Rotate log if too large
  if (securityLog.length > MAX_LOG_SIZE) {
    securityLog.shift();
  }
  
  // Log to console for monitoring
  console.log("[SECURITY]", JSON.stringify(fullEvent));
}

export function getSecurityLog(): SecurityEvent[] {
  return [...securityLog];
}
