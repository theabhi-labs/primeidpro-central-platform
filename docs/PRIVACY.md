# Automated Ephemeral Privacy & Retention Specification — Prime ID Pro

---

## 1. Zero-Permanent-Image Architecture

1. **Storage Isolation**:
   - Customer photos are uploaded exclusively to private object storage (**Cloudflare R2** in Production, Local Storage Driver in Dev/Testing).
   - Public bucket access is strictly prohibited. Objects cannot be listed or accessed via unauthenticated public URLs.
   - MongoDB stores only metadata, bounding coordinates, and server-generated `storageKey`. Raw image binaries and base64 strings are **never** stored in MongoDB collections.

2. **Dual-Tier Retention Policy**:
   - **Abandoned / Unclaimed Uploads**: Customer photos uploaded without placing a completed order expire within **2 hours** (`UPLOAD_RETENTION_HOURS = 2`).
   - **Completed Job Prints**: Once a print job is successfully completed by the desktop client (`POST /api/v1/app/jobs/:jobId/complete`), the server schedules an authoritative **10-minute auto-purge timer** (`PHOTO_RETENTION_MINUTES = 10`).

3. **Background Privacy & Orphan Cleanup Worker**:
   - Recurring daemon worker (`cleanupService.js`) runs periodically (default: 60s).
   - Sweeps:
     1. Expired completed/failed job photos (`photoExpiresAt <= now`, `isPhotoPurged: false`).
     2. Expired unclaimed upload sessions (`photoExpiresAt <= now`, `isClaimed: false`, `isPurged: false`).
     3. Orphan upload sessions with completed parent jobs.
   - **Idempotent Deletion**: If an object is already missing from R2 (`NoSuchKey` / 404), the deletion is treated as successful.
   - **Retry & Backoff**: Deletion failures (e.g. transient network timeouts) do NOT mark records purged prematurely; they increment `deleteRetryCount` and schedule retries with exponential backoff.
   - **Purge Ordering**: Physical deletion from R2 occurs first; only upon successful deletion are database flags updated (`isPhotoPurged = true`, `purgedAt = now`, `temporaryPhotoUrl = null`).

---

## 2. Server-Generated Storage Keys & Authorization

1. **Storage Key Format**:
   ```
   temp-photos/YYYY/MM/DD/center_<centerId>/<16-byte-cryptographic-random-hex>.jpg
   ```
2. **Security Properties**:
   - Unpredictable and non-sequential.
   - Client filenames and path traversal attempts (e.g. `../../`) are strictly sanitized and stripped.
   - Cross-center isolation is enforced: devices and centers can only access photos assigned to their tenant.

---

## 3. Short-Lived Signed URLs

- **Desktop Download**: Central API generates short-lived presigned download URLs (TTL: 15–30 minutes) for authenticated desktop client hardware.
- **Client Preview**: Short-lived signed URLs (TTL: 15 minutes) with cryptographic HMAC signatures prevent unauthorized enumeration of photo objects.
