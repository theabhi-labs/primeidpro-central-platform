# PRIME ID PRO — CENTRAL WEB PLATFORM API REFERENCE

Domain: `https://primeidpro.online`  
Base API Path: `/api/v1`

---

## 🔐 1. Authentication & Users (`/api/v1/auth`)

### `POST /auth/register`
Registers a new Customer or CSC Studio Partner account.
- **Body**:
  ```json
  {
    "name": "Rajesh Sharma",
    "email": "rajesh@example.com",
    "password": "SecurePassword123!",
    "phone": "+919876543210",
    "role": "CSC_OPERATOR",
    "centerName": "Prime Digital Studio",
    "address": "Main Market, Sector 12",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001"
  }
  ```
- **Response (201)**: Returns JWT bearer token and user/studio profile.

### `POST /auth/login`
Authenticates a user with email and password.
- **Body**:
  ```json
  {
    "email": "admin@primeidpro.online",
    "password": "AdminPassword2026!"
  }
  ```
- **Response (200)**: Returns `{ token, user }`.

### `GET /auth/me`
Returns current authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`

---

## 📸 2. Customer & Kiosk Ordering (`/api/v1/customer`)

### `POST /customer/upload-photo`
Uploads a temporary photo to object storage (Cloudflare R2 / S3 / Local).
- **Form Data**: `photo` (File: JPEG/PNG/WEBP up to 25MB)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "storageKey": "temp-photos/1788131923572-uuid.jpg",
      "photoUrl": "/api/v1/customer/photo-stream/temp-photos%2F1788131923572-uuid.jpg",
      "sizeBytes": 204850,
      "expiresInMinutes": 120
    }
  }
  ```

### `GET /customer/templates`
Fetches standard ID templates, dimensions, and customer prices.

### `GET /customer/centers`
Lists active CSC photo studios across India. Query parameters: `search`, `city`, `state`.

### `GET /customer/centers/:identifier`
Fetches studio details by slug or center code (e.g. `delhi-central-hub` or `CSC-DL-1001`).

### `POST /customer/orders`
Creates a customer print order and generates a Razorpay Order ID.
- **Body**:
  ```json
  {
    "centerId": "6a94ba3c7ed06350887a50d9",
    "customerName": "Amit Verma",
    "customerPhone": "+919811223344",
    "customerEmail": "amit@example.com",
    "serviceType": "PASSPORT_PHOTO",
    "copies": 8,
    "storageKey": "temp-photos/uuid.jpg",
    "photoUrl": "/api/v1/customer/photo-stream/...",
    "cropSettings": { "zoom": 1.2, "rotation": 0, "aspectRatio": 0.777 },
    "backgroundColor": "#FFFFFF",
    "paymentMethod": "RAZORPAY"
  }
  ```
- **Response (201)**: Returns `{ job: { jobCode, trackingPin, priceInr, ... }, razorpayOrder: { orderId, amount, keyId } }`.

### `GET /customer/orders/track`
Public real-time order tracking.
- **Query**: `?jobCode=PIP-2026-98124&trackingPin=4102`
- **Response (200)**: Returns job status, steps milestone array, studio location, and temporary photo download link if completed.

---

## 💳 3. Payment Processing (`/api/v1/payments` & `/api/v1/webhooks`)

### `POST /payments/verify-payment`
Cryptographically verifies Razorpay checkout signature.
- **Body**:
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "hmac_sha256_hex",
    "jobId": "job_mongo_id"
  }
  ```

### `POST /payments/wallet-order`
Creates Razorpay order for CSC Studio wallet recharge.

### `POST /payments/verify-wallet-topup`
Verifies wallet top-up payment and updates double-entry credit ledger.

### `POST /webhooks/razorpay`
Automated webhook receiver verified with `X-Razorpay-Signature` HMAC SHA-256 header.

---

## 🏪 4. CSC Studio Portal (`/api/v1/csc`)

- `GET /csc/dashboard-stats`: Returns today's jobs count, revenue, wallet balance, and active desktop devices.
- `GET /csc/jobs`: Paginated incoming print queue with `status` filter (`ALL`, `PENDING`, `COMPLETED`).
- `POST /csc/walk-in-order`: Quick cash counter order intake.
- `GET /csc/wallet`: Wallet balance and transaction ledger.
- `POST /csc/pairing-code`: Generates 15-minute 6-digit pairing code for desktop app.
- `GET /csc/kiosk-qr`: Generates high-res QR code poster data URI for studio desk.
- `GET /csc/devices`: Lists connected desktop devices with online/offline ping indicator.
- `DELETE /csc/devices/:deviceId`: Revokes desktop client authorization.

---

## 💻 5. Desktop Electron App Sync Engine (`/api/v1/desktop`)

- `POST /desktop/device/pair`: Pairs desktop client using 6-digit code or installation ID. Returns permanent `deviceToken` and `deviceId`.
- `POST /desktop/device/heartbeat`: Periodic heartbeat reporting printer hardware status and queue size.
- `GET /desktop/jobs/pending`: Polls pending print jobs awaiting processing.
- `POST /desktop/jobs/:id/claim`: Locks job to claiming desktop client.
- `POST /desktop/jobs/:id/status`: Transitions job state (`DOWNLOADING`, `PROCESSING`, `READY`, `PRINTING`).
- `POST /desktop/jobs/:id/complete`: Posts completion with `idempotencyKey`. Deducts platform credit from studio ledger and schedules 10-minute photo auto-purge.
- `GET /desktop/updates/check`: Auto-updater manifest check for Electron client.

---

## 🛡️ 6. Super Admin Hub (`/api/v1/admin`)

- `GET /admin/analytics`: Executive overview of platform revenue, nationwide studios, and storage usage.
- `GET /admin/studios` & `PATCH /admin/studios/:id`: Studio approvals, suspensions, and manual credit adjustments with audit logs.
- `GET /admin/devices` & `PATCH /admin/devices/:id`: Nationwide desktop hardware oversight and revocation.
- `GET /admin/jobs`: Global cross-India print feed.
- `GET /admin/ledger`: Financial and credit transaction audit trail.
- `GET /admin/pricing` & `PUT /admin/pricing/:id`: Service dimension and credit pricing matrix editor.
- `GET /admin/releases` & `POST /admin/releases`: Desktop client version publisher.
