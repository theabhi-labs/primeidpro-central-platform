# REST API Reference — Prime ID Pro

> **Base URL**: `https://primeidpro.online/api/v1`

---

## 1. Public & Customer Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/customer/upload-photo` | Uploads customer photo to Cloudflare R2 / temporary storage, returns `storageKey`, `uploadSessionId`, and signed preview URL |
| `GET` | `/customer/photo-stream/:key` | Streams temporary photo with cryptographic signature & expiration check |
| `GET` | `/customer/templates` | Returns standard ID dimensions & photo specifications |
| `GET` | `/customer/centers` | Lists active verified CSC studio partner centers |
| `GET` | `/customer/centers/:id` | Resolves studio center details by slug, center code, or ID |
| `POST` | `/orders/quote` | Authoritatively calculates pricing quote for quantity & service type |
| `POST` | `/orders/create` | Creates customer order with multi-photo JobItems and Razorpay order |
| `GET` | `/orders/track` | Tracks real-time order lifecycle using `jobCode` and `trackingPin` |

---

## 2. Payments & Razorpay

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/payments/create-order` | Generates Razorpay order for customer checkout |
| `POST` | `/payments/verify-payment` | Cryptographically verifies Razorpay signature and queues print job |
| `POST` | `/payments/wallet-order` | Generates Razorpay order for studio credit recharge |
| `POST` | `/payments/verify-wallet-topup` | Verifies top-up signature and credits studio wallet with idempotency |
| `POST` | `/webhooks/razorpay` | Handles asynchronous Razorpay payment capture events |

---

## 3. CSC Studio Operator Routes (Auth Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/centers/dashboard` | Returns operator metrics, daily orders, credit balance, devices |
| `GET` | `/centers/orders` | Paginated list of studio orders with status filters |
| `POST` | `/centers/orders/:id/cash-received` | Confirms counter cash payment and transitions job to QUEUED |
| `GET` | `/centers/credits` | Center credit balance and double-entry transaction history |
| `GET` | `/centers/qr` | Generates printable counter QR poster and kiosk URL |
| `POST` | `/centers/qr/regenerate` | Rotates and regenerates studio counter QR token |
| `POST` | `/csc/pairing-code` | Generates 6-digit hardware binding PIN for desktop client |
| `GET` | `/centers/devices` | Returns connected Windows desktop machines |
| `DELETE` | `/centers/devices/:id` | Revokes desktop device authorization |
| `GET` | `/centers/service-settings` | Returns per-photo rates, quantity constraints, toggles |
| `PUT` | `/centers/service-settings` | Updates per-photo rates and quantity rules |

---

## 4. Desktop Client Routes (Device Token Required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/devices/register` | Binds Electron desktop client using 6-digit pairing code |
| `POST` | `/devices/activate` | Re-activates or registers desktop client hardware |
| `POST` | `/devices/heartbeat` | Transmits machine status, printer state, and queue health |
| `GET` | `/app/pending-jobs` | Polls tenant-isolated QUEUED jobs with short-lived signed photo download URLs |
| `POST` | `/app/jobs/:jobId/ack` | Atomically claims job to lock it against other machines |
| `POST` | `/app/jobs/:jobId/status` | Updates progress (`DOWNLOADING`, `PROCESSING`, `PRINTING`) |
| `GET` | `/app/jobs/:jobId/download-photo` | Generates short-lived signed photo download URL or streams binary |
| `POST` | `/app/jobs/:jobId/complete` | Completes print, deducts platform credits, schedules 10m photo purge |
| `GET` | `/app/update` | Checks auto-updater manifests for new desktop builds |

---

## 5. Super Admin Routes (Admin Role Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Global platform analytics & storage diagnostics |
| `GET` | `/admin/centers` | Nationwide list of CSC studio centers |
| `PATCH` | `/admin/centers/:id` | Approves/suspends center or performs manual credit adjustment |
| `GET` | `/admin/devices` | Global hardware registry with remote revocation |
| `PATCH` | `/admin/devices/:id` | Revokes or blocks hardware machine |
| `GET` | `/admin/job-types` | Lists document formats and pricing rules matrix |
| `PUT` | `/admin/job-types/:id` | Updates retail customer price and platform credit cost |
| `GET` | `/admin/packages` | Lists credit recharge packages |
| `POST` | `/admin/packages` | Creates new credit package |
| `PUT` | `/admin/packages/:id` | Updates credit package price or credits |
| `GET` | `/admin/releases` | Lists desktop auto-update releases |
| `POST` | `/admin/releases` | Publishes new release manifest |
| `GET` | `/admin/audit-logs` | Immutable security audit trail |
| `GET` | `/health` | Server and storage driver connectivity health check |
