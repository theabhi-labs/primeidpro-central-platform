# Production Security Specification — Prime ID Pro

---

## 1. Authentication & Authorization Architecture

1. **Dual JWT Token Ecosystem**:
   - **User Session Tokens**: Short-to-medium lifespan JWTs for CSC Operators and Administrators, signed with `JWT_SECRET`.
   - **Hardware Device Tokens**: Long-lived machine tokens for Electron desktop clients, signed with separate `DEVICE_JWT_SECRET` and bound to hardware fingerprints.

2. **Role-Based Access Control (RBAC)**:
   - `SUPER_ADMIN` / `ADMIN`: Global analytics, center oversight, ledger audits, package editing, device revocations.
   - `CSC` / `CSC_OPERATOR`: Isolated tenant scope. Operators can only query and process jobs belonging to their bound `centerId`.
   - `CUSTOMER`: Public unauthenticated order submission with signed tracking PIN security.

---

## 2. Cryptographic Security Standards

1. **Razorpay Checkout Verification**:
   - Client-reported payments are validated server-side by computing HMAC SHA-256 over `${razorpay_order_id}|${razorpay_payment_id}` using `RAZORPAY_KEY_SECRET`.

2. **Razorpay Webhook Signatures**:
   - Webhook payloads preserve raw byte buffers to compute HMAC SHA-256 and match `X-Razorpay-Signature`.

3. **Double-Entry Ledger Idempotency**:
   - Unique sparse index on `CreditTransaction.idempotencyKey` prevents duplicate deductions and recharges even under concurrent retry scenarios.

4. **Hardware Revocation Guard**:
   - If an operator or admin marks a device as `REVOKED` or `BLOCKED`, the device authorization middleware immediately rejects incoming sync requests with HTTP 403.
