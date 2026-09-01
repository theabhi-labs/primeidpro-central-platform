# PRIME ID PRO — Central Web Platform & Cloud Ecosystem

> **Production Hardened Cloud Web Platform & Windows Desktop Sync Hub**  
> **Domain**: [https://primeidpro.online](https://primeidpro.online)  
> **Target Audience**: CSC Centers, Cyber Cafes, Photocopy Shops, Printing Centers & Digital Studios.

---

## 🌟 Executive Overview & Value Proposition

**"Customer QR scan करे → Photo upload करे → Payment करे → Photo automatically CSC के Prime ID Pro desktop app में आए → Operator print करे."**

Prime ID Pro replaces friction-heavy customer photo exchanges (WhatsApp Web, Bluetooth, email attachments) with an instant, privacy-first mobile self-service QR kiosk connected in real-time to a production-hardened Windows desktop application.

```
┌────────────────────────┐      ┌─────────────────────────┐      ┌───────────────────────────┐
│   Customer Mobile QR   │ ───► │  Central MERN Platform  │ ───► │ Prime ID Pro Desktop App  │
│  (Camera/Gallery/UPI)  │      │ (Auth, Quote, Ledger)   │      │ (Offline AI, 300DPI Print)│
└────────────────────────┘      └─────────────────────────┘      └───────────────────────────┘
```

---

## 🚀 Key Architectural Pillars

1. **Production Desktop Application Safety (Non-Negotiable Rule #1)**:
   - Full backward compatibility with the existing Prime ID Pro Electron desktop application.
   - All AI face mesh, Rembg background removal, OpenCV detection, and 300 DPI native direct printing operations remain 100% offline-ready with zero internet dependencies for image processing.

2. **Authoritative Server Pricing**:
   - Fixed ₹2 platform fee per order.
   - Center-specific per-photo rates, minimum quantities, maximum quantities, and step validations enforced exclusively on the backend.
   - Client price manipulation attempts are rejected with 400 Bad Request.

3. **Multi-Photo Batch Processing**:
   - Single customer orders can contain 1, 2, 3, 5, 10, or 20+ photos (`JobItems`) under one `Order` and `Job`.

4. **Double-Entry Credit Wallet**:
   - 1 photo printed = 2 credits deducted (₹2).
   - Balance can never become negative.
   - Idempotent deduplication keys guarantee callbacks and webhooks never deduct or add twice.

5. **10-Minute Ephemeral Privacy Retention**:
   - Customer photos uploaded to temporary object storage are purged automatically 10 minutes post-printing.
   - Zero customer photo binaries stored permanently in MongoDB.

---

## 📂 Repository Structure

```
primeidpro-central-platform/
├── client/                     # Vite + React 18+ Tailwind Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Footer, KioskQrCard
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/          # Super Admin Portal (8 views)
│   │   │   ├── auth/           # Login, Register, Forgot Password
│   │   │   ├── csc/            # CSC Operator Portal (7 views)
│   │   │   └── public/         # Marketing, Kiosk, Tracking, Legal (11 views)
│   │   └── services/           # Axios API Client & Razorpay Checkout Helper
│   └── dist/                   # Production compiled assets
├── server/                     # Node.js + Express + Mongoose Backend
│   ├── src/
│   │   ├── config/             # DB, Constants, Environment config
│   │   ├── controllers/        # Order, Center, Device, Admin, Payment, Auth, Webhook
│   │   ├── middleware/         # Auth, Role, DeviceAuth, RateLimit, ErrorHandler
│   │   ├── models/             # User, Center, Wallet, Ledger, Order, Job, JobItem, Device...
│   │   ├── routes/             # v1 REST API & Aliases (/orders, /centers, /devices, /app...)
│   │   ├── services/           # CreditLedger, Storage, Razorpay, Cleanup, JobEngine
│   │   └── utils/              # ApiResponse, Logger, JWT, Seeder
│   └── tests/                  # 20-Point Production Automated Integration Test Suite
└── docs/                       # 10 Production Markdown Reference Guides
```

---

## ⚡ Quick Start

### 1. Backend Server
```bash
cd server
npm install
npm run seed      # Seeds admin@primeidpro.online and demo CSC center
npm start         # Runs Express server on port 5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
npm run build     # Compiles production distribution bundle
```

### 3. Automated Test Suite
```bash
cd server
node tests/run-verification.js   # Executes 20-point production test suite
```
