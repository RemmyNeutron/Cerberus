import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import {
  securityHeaders,
  apiRateLimiter,
  hppMiddleware,
  noCacheHeaders,
  secureErrorHandler,
  addRequestId,
  validateRedirect,
  csrfProtection,
} from "./security";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ============ SECURITY MIDDLEWARE (Applied First) ============

// Add request ID for tracing
app.use(addRequestId);

// Security headers (XSS, Clickjacking, Content-Type Sniffing, etc.)
app.use(securityHeaders);

// Rate limiting for all API requests
app.use("/api", apiRateLimiter);

// HTTP Parameter Pollution prevention
app.use(hppMiddleware);

// Validate redirect parameters
app.use(validateRedirect);

// No-cache headers for API responses
app.use(noCacheHeaders);

// CSRF protection (origin checking for state-changing requests)
app.use("/api", csrfProtection);

// ============ BODY PARSING ============

app.use(
  express.json({
    limit: "10kb", // Limit body size to prevent DoS
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ============ LOGGING ============

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Don't log sensitive data
        const safeResponse = { ...capturedJsonResponse };
        delete safeResponse.password;
        delete safeResponse.token;
        delete safeResponse.secret;
        logLine += ` :: ${JSON.stringify(safeResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// ============ ROUTES ============

(async () => {
  await registerRoutes(httpServer, app);

  // Secure error handler (prevents information disclosure)
  app.use(secureErrorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
