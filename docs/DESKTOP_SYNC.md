# Electron Desktop Sync Engine Guide — Prime ID Pro

---

## 1. Zero-Friction 6-Digit Device Pairing

1. Operator opens the CSC Portal and clicks **Generate Pairing Code** (generates a temporary 6-digit numeric PIN, e.g. `889900`).
2. Operator enters the 6-digit PIN in the Prime ID Pro Electron desktop application.
3. The desktop client posts to `/api/v1/devices/register` with `installationId`, `pairingCode`, and `hardwareFingerprint`.
4. The server validates the PIN, binds the machine to the `centerId`, and returns a permanent device authentication token (`X-Device-Token`).

---

## 2. Real-Time Job Polling & Concurrency Protection

- Desktop client polls `GET /api/v1/app/pending-jobs` every 3-5 seconds.
- Strict Tenant Isolation: Only `QUEUED` jobs belonging to the machine's bound `centerId` are returned. Unpaid jobs (`CREATED` or `CASH_PENDING`) are **never** returned.
- When an operator initiates processing, the desktop issues `POST /api/v1/app/jobs/:id/ack`. The server performs an atomic conditional find-and-update to lock the job to that specific device ID, preventing race conditions across multi-counter setups.

---

## 3. Supported Photo Hardware

- **DNP**: DS-RX1HS, DS620, DS820, QW410
- **Canon**: Selphy CP1300, CP1500, Pixma G570, G670
- **Epson**: EcoTank L8050, L805, L18050, L3250
- **Brother**: DCP-T820DW, MFC-T920DW
- **PVC Card Printers**: Magicard, Zebra ZC300, Evolis Zenius
