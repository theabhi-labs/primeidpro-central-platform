# PRIME ID PRO — PRODUCTION GO-LIVE CHECKLIST

> Pre-Flight Production Readiness Verification across 11 Core Domains.

---

### 1. DATABASE (MongoDB Atlas)
- [x] VERIFIED: In-memory database fallback strictly rejected in production (`USE_MEMORY_DB_FALLBACK=false`).
- [x] VERIFIED: Localhost connection strings rejected by production startup validator.
- [ ] NOT VERIFIED: Real MongoDB Atlas cluster provisioned in production cloud.
- [ ] NOT VERIFIED: Database least-privilege user credentials configured in Render environment.
- [ ] NOT VERIFIED: Automated daily snapshot backups enabled in Atlas.

---

### 2. PAYMENTS (Razorpay Live)
- [x] VERIFIED: Server enforces authoritative pricing; client amount/credit injection is impossible.
- [x] VERIFIED: Insecure `PAYMENT_TEST_MODE=true` rejected by production validator.
- [x] VERIFIED: Webhook signature verification and payment idempotency tests 100% passed.
- [ ] NOT VERIFIED: Live Razorpay credentials (`RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`) provisioned.
- [ ] NOT VERIFIED: Live webhook endpoint registered in Razorpay merchant dashboard.

---

### 3. STORAGE (Cloudflare R2)
- [x] VERIFIED: Private bucket architecture with no public object exposure.
- [x] VERIFIED: Server-generated unpredictable storage keys prevent path traversal.
- [x] VERIFIED: Short-lived presigned URLs (15m TTL) generated for uploads and downloads.
- [x] VERIFIED: Missing R2 credentials strictly halt startup when `STORAGE_DRIVER=R2`.
- [ ] NOT VERIFIED: Real Cloudflare R2 bucket (`primeidpro-private-temp-photos`) created.
- [ ] NOT VERIFIED: Real R2 API token credentials configured in Render environment.

---

### 4. SECURITY & AUTHENTICATION
- [x] VERIFIED: Weak/default fallbacks (`DefaultPass2026!`, default JWT keys) removed from source.
- [x] VERIFIED: User creation without password or hash strictly rejected.
- [x] VERIFIED: Strict CORS origin whitelisting (`https://primeidpro.online`, `https://www.primeidpro.online`).
- [x] VERIFIED: `express-mongo-sanitize` active against NoSQL operator injection.
- [x] VERIFIED: Request correlation IDs (`X-Request-Id`) generated and echoed in headers.
- [x] VERIFIED: Safe production error responses with zero stack traces or internal paths.
- [x] VERIFIED: Password reset token hashing (SHA-256) and expiration handling.

---

### 5. FRONTEND (React + Vite SPA)
- [x] VERIFIED: Production build succeeds cleanly (`npm run build`, 0 errors).
- [x] VERIFIED: Zero hardcoded localhost API references in client source code.
- [x] VERIFIED: Configurable API base URL via `VITE_API_URL` or `VITE_API_BASE_URL`.
- [x] VERIFIED: SPA rewrite rules (`_redirects`, `vercel.json`, `render.yaml`) prevent 404 on refresh.
- [ ] NOT VERIFIED: Deployed on static host (Render Static Site or Vercel).

---

### 6. API SERVER (Express / Node.js)
- [x] VERIFIED: Reverse proxy trust configured (`app.set('trust proxy', 1)`).
- [x] VERIFIED: Distinct Liveness (`/api/v1/health`) and Readiness (`/api/v1/health/ready`) probes.
- [x] VERIFIED: Production fail-fast startup validator active.
- [ ] NOT VERIFIED: Deployed on Render Web Service.

---

### 7. DOMAIN & HTTPS
- [x] VERIFIED: Production domains configured (`https://primeidpro.online`, `https://api.primeidpro.online`).
- [ ] NOT VERIFIED: Cloudflare DNS CNAME records routed to Render hostnames.
- [ ] NOT VERIFIED: SSL/TLS certificates active and verified via browser.

---

### 8. MONITORING & LOGGING
- [x] VERIFIED: Zero credential or sensitive data leakage in log output.
- [x] VERIFIED: Structured operational logs include timestamps and request IDs.
- [ ] NOT VERIFIED: Render log aggregation or Datadog/Logtail alerts configured.

---

### 9. BACKUPS & DISASTER RECOVERY
- [ ] NOT VERIFIED: Point-in-time recovery (PITR) enabled on MongoDB Atlas.
- [ ] NOT VERIFIED: Documented recovery procedure tested in staging.

---

### 10. DESKTOP INTEGRATION (Electron Client)
- [x] VERIFIED: Hardware pairing code generation and token hashing contract verified.
- [x] VERIFIED: Strict tenant isolation prevents cross-center pending job polling.
- [x] VERIFIED: Multi-photo JobItems and signed download URLs delivered to desktop.
- [ ] NOT VERIFIED: Physical Windows desktop client connected to production API.
- [ ] NOT VERIFIED: Native 300 DPI printer driver spooling verified on physical printer hardware.

---

### 11. PRIVACY & DATA RETENTION
- [x] VERIFIED: 10-minute auto-purge timer scheduled upon desktop print completion.
- [x] VERIFIED: 2-hour abandoned upload sweep active via `UploadSession` tracking.
- [x] VERIFIED: Exponential backoff retries on deletion failures (idempotent for missing objects).
- [x] VERIFIED: Zero customer image binaries or base64 strings stored in MongoDB.
- [ ] NOT VERIFIED: Background cleanup worker verified running in production container.
