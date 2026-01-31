# 🐺 Cerberus — AI Security & Threat Intelligence Platform

Cerberus is a next-generation AI-powered security platform focused on detecting, monitoring, and mitigating digital threats including malicious automation, AI-generated content abuse, session attacks, and unauthorized activity patterns.

Built with security-first architecture, Cerberus acts as a real-time watchdog protecting modern web infrastructure.

---

## 🚀 Features

### 🔐 Core Security
- CSRF protection with cryptographically signed session tokens
- Secure session handling using environment-based secrets
- Hardened authentication middleware
- Token validation and expiration enforcement

### 🤖 AI & Automation Defense
- Detection of AI-generated media and suspicious uploads
- Monitoring of anomalous behavioral patterns
- Anti-bot and abuse heuristics

### 📊 Monitoring Dashboard
- Real-time blocked threat visibility
- User activity tracking
- Event auditing

### 🧱 Infrastructure Protection
- Environment variable isolation
- Secret leakage prevention
- Production-safe configuration defaults

---

## 🏗 Tech Stack

**Frontend**
- Vite
- TailwindCSS
- TypeScript

**Backend**
- Node.js
- Express
- TypeScript
- Crypto (HMAC token signing)

**Security**
- CSRF token generation + validation
- Session secret enforcement
- Environment isolation

---

## ⚙ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/RemmyNeutron/Cerberus.git
cd Cerberus
