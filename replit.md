# Cerberus Security Platform

## Overview
Cerberus is an AI-powered security platform featuring three specialized "heads" of protection, inspired by the mythological guardian of the underworld:

1. **Head 1: AI Deepfake Detection** - Advanced neural networks to detect manipulated media, synthetic voices, and generated content
2. **Head 2: Anti-AI Surveillance Monitoring** - Monitor and neutralize unauthorized AI systems attempting to track or profile your digital presence  
3. **Head 3: Adaptive Threat Containment** - Self-evolving defense mechanisms that learn from attacks

## Tech Stack
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn/UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OIDC-based)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query)

## Security Implementation

### HTTP Security Headers
- **Helmet middleware** with environment-specific CSP
- **X-Frame-Options: DENY** - Clickjacking protection
- **X-Content-Type-Options: nosniff** - MIME sniffing prevention
- **X-XSS-Protection** - Legacy XSS filter
- **Strict-Transport-Security** - HTTPS enforcement
- **Referrer-Policy: strict-origin-when-cross-origin**

### CSRF Protection
- **SameSite=lax cookies** - Prevents cross-site request forgery
- **Origin header validation** - Blocks cross-origin state-changing requests
- **CSRF token endpoint** available for additional protection

### Input Validation & Injection Prevention
- **Zod schemas** for all request body validation
- **Drizzle ORM** with parameterized queries (SQL injection prevention)
- **Input sanitization** for XSS prevention
- **UUID validation** for all ID parameters

### Access Control
- **IDOR protection** - All resources filtered by authenticated userId
- **Ownership verification** on all update/delete operations
- **Unique constraint** on userSubscriptions.userId (race condition prevention)

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes
- **Sensitive operations**: 5 requests per minute

### Session Security
- **httpOnly cookies** - JavaScript access blocked
- **secure cookies** - HTTPS only
- **SameSite=lax** - CSRF protection
- **__Host- prefix** - Additional cookie security
- **PostgreSQL session storage** with TTL

### Additional Protections
- **HPP middleware** - HTTP Parameter Pollution prevention
- **JSON body limit** - 10KB (DoS prevention)
- **No-cache headers** - Prevents sensitive data caching
- **Secure error handler** - No stack traces in production
- **Request ID tracking** - Security event tracing
- **Security audit logging** - All security events logged

## Project Structure
```
client/
├── src/
│   ├── components/     # React components
│   │   ├── ui/         # Shadcn UI components
│   │   ├── cerberus-logo.tsx
│   │   ├── navigation.tsx
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── pricing-section.tsx
│   │   ├── protection-status-card.tsx
│   │   ├── stats-card.tsx
│   │   ├── threat-log-item.tsx
│   │   └── footer.tsx
│   ├── pages/          # Page components
│   │   ├── landing.tsx
│   │   └── dashboard.tsx
│   ├── hooks/          # Custom React hooks
│   │   └── use-auth.ts
│   └── lib/            # Utility functions

server/
├── routes.ts           # API endpoints
├── storage.ts          # Database operations
├── security.ts         # Security middleware
├── seed.ts             # Database seeding
├── db.ts               # Database connection
└── replit_integrations/
    └── auth/           # Authentication module

shared/
├── schema.ts           # Drizzle schema definitions
└── models/
    └── auth.ts         # Auth-related models
```

## API Endpoints

### Public Endpoints
- `GET /api/plans` - Get subscription plans

### Protected Endpoints (require authentication)
- `GET /api/auth/user` - Get current user
- `GET /api/csrf-token` - Get CSRF token
- `GET /api/subscription` - Get user subscription
- `POST /api/subscription` - Create subscription (rate limited)
- `PATCH /api/subscription` - Update subscription (rate limited)
- `DELETE /api/subscription` - Cancel subscription (rate limited)
- `GET /api/protection-status` - Get protection status
- `PATCH /api/protection-status` - Update protection toggles
- `GET /api/threat-logs` - Get threat logs
- `POST /api/threat-logs` - Create threat log
- `PATCH /api/threat-logs/:id` - Update threat log (IDOR protected)
- `GET /api/stats` - Get security stats

### Auth Routes
- `GET /api/login` - Begin login flow (rate limited)
- `GET /api/logout` - Logout
- `GET /api/callback` - OIDC callback (rate limited)

## Database Schema
- `users` - User accounts (managed by Replit Auth)
- `sessions` - Session storage
- `subscription_plans` - Available subscription tiers (Basic, Pro, Enterprise)
- `user_subscriptions` - User subscription records (unique on userId)
- `protection_status` - Per-user protection toggle states
- `threat_logs` - Security threat detection logs

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database

## Features
- Landing page with hero, features, and pricing sections
- User authentication via Replit Auth
- Dashboard with protection status for each security head
- Real-time threat log display
- Security stats overview
- Subscription tier selection (Basic $9/mo, Pro $29/mo, Enterprise $99/mo)
- Monthly/yearly billing toggle
- Dark/light theme toggle
