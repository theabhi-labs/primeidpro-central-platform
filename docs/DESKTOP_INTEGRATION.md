# PRIME ID PRO — DESKTOP CLIENT INTEGRATION GUIDE

## 🎯 Purpose
This document provides full technical instructions for integrating the **Prime ID Pro Electron Desktop Application** with the central web platform (`https://primeidpro.online`).

---

## 🏗️ Desktop Architecture & Workflow

```
[ Central Cloud Server ] (primeidpro.online)
           │
           │ HTTPS Polling / Heartbeat
           ▼
[ Electron Main Process ] (electron/src/)
   ├── network/apiClient.js
   ├── device/deviceManager.js
   ├── network/syncQueue.js (SQLite WAL)
   └── jobs/jobEngine.js
           │
           │ IPC (preload.js)
           ▼
[ Local Python Engine ] (127.0.0.1:10000)
   ├── MediaPipe Face Mesh & Haar Cascades
   └── Rembg / ONNX Background Removal
           │
           ▼
[ Hardened Print Engine ]
   ├── Offscreen BrowserWindow (300 DPI layout)
   ├── Native Windows Spooler / PDF Fallback
   └── 10-Minute Retention Auto-Purge
           │
           │ Completion Callback (Idempotency Key)
           ▼
[ Central Credit Ledger ] (Debit ₹5 per job)
```

---

## 🔑 1. Device Pairing & Authentication

When the desktop application is installed on a studio PC:
1. Generate an `installationId` (UUID v4) and hardware fingerprint (CPU ID, motherboard UUID).
2. The studio operator generates a 6-digit pairing code from the Studio Web Portal (`/csc/devices`).
3. The desktop app calls the central API:
   ```http
   POST https://primeidpro.online/api/v1/desktop/device/pair
   Content-Type: application/json

   {
     "installationId": "d891b72a-4318-4e12-8822-6e2c918a0021",
     "pairingCode": "889900",
     "deviceName": "DESKTOP-FRONT-COUNTER",
     "hardwareFingerprint": "win32-intel-core-i7-hash",
     "appVersion": "1.0.0",
     "osPlatform": "win32"
   }
   ```
4. The server validates the code and responds with:
   ```json
   {
     "success": true,
     "data": {
       "deviceId": "PIP-DEV-51W15N3Z",
       "deviceToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "center": {
         "id": "6a94ba3c...",
         "centerName": "Prime Digital Studio",
         "centerCode": "CSC-DL-1001",
         "walletBalance": 500
       }
     }
   }
   ```
5. Store the `deviceToken` securely using Electron's `safeStorage` (Windows DPAPI).

---

## 🔄 2. Periodic Polling & Heartbeat

Every 10 seconds, the desktop background worker sends a heartbeat and checks for pending jobs:

```http
POST https://primeidpro.online/api/v1/desktop/device/heartbeat
X-Device-Token: <token>
X-Device-Id: PIP-DEV-51W15N3Z
X-Installation-Id: d891b72a-4318-4e12-8822-6e2c918a0021
Content-Type: application/json

{
  "printerStatus": { "name": "DNP DS-RX1HS Photo Printer", "isReady": true },
  "diskSpaceMb": 15420,
  "pendingJobsInQueue": 0
}
```

If `pendingJobsCount > 0`, fetch the queue:

```http
GET https://primeidpro.online/api/v1/desktop/jobs/pending
X-Device-Token: <token>
X-Device-Id: PIP-DEV-51W15N3Z
```

---

## ⚡ 3. Job Claim & Local Processing

1. **Claim Job**:
   ```http
   POST https://primeidpro.online/api/v1/desktop/jobs/:id/claim
   X-Device-Token: <token>
   ```
2. **Download Temporary Photo**:
   Download from `job.temporaryPhotoUrl`.
3. **Local AI Execution**:
   - Send photo to local Python service (`http://127.0.0.1:10000/process-photo`).
   - Run MediaPipe Face Mesh alignment.
   - Run Rembg background removal with `job.backgroundColor`.
   - Update job status to `PROCESSING` via `POST /desktop/jobs/:id/status`.
4. **Layout & Print Execution**:
   - Format 300 DPI grid (e.g. 8 passport photos on 4x6 inch paper).
   - Render offscreen in hidden `BrowserWindow`.
   - Send to native Windows printer spooler.
   - Update status to `PRINTING`.

---

## 🎯 4. Completion Callback & Ledger Deduction

Once native printing finishes or the customer collects the physical print:

```http
POST https://primeidpro.online/api/v1/desktop/jobs/:id/complete
X-Device-Token: <token>
X-Device-Id: PIP-DEV-51W15N3Z
Content-Type: application/json

{
  "idempotencyKey": "complete_PIP-2026-17448_101",
  "printMetrics": {
    "paperSize": "4x6",
    "copies": 8,
    "durationMs": 4200
  }
}
```

### Server Side Action:
1. Marks job status as `COMPLETED`.
2. Automatically debits the CSC Studio wallet (e.g. ₹5) in the `TransactionLedger`.
3. Schedules the 10-minute temporary customer photo deletion (Zero permanent storage in Mongo).
4. Updates customer tracking stepper to `Ready for Pickup / Done`.

---

## 🚀 5. Auto-Updater Manifest Check

On desktop startup or user manual check:

```http
GET https://primeidpro.online/api/v1/desktop/updates/check?version=1.0.0&channel=stable
```

Response:
```json
{
  "success": true,
  "data": {
    "updateAvailable": true,
    "version": "1.0.1",
    "downloadUrl": "https://primeidpro.online/downloads/PrimeIdPro-Setup-1.0.1.exe",
    "releaseNotes": "Improved face mesh alignment and new visa presets",
    "isMandatory": false,
    "minimumSupportedVersion": "1.0.0"
  }
}
```
If `isMandatory: true`, the desktop client blocks further photo processing until updated.
