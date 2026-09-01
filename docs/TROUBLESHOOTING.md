# Operational Troubleshooting Guide — Prime ID Pro

---

## 1. Common Diagnostics & Solutions

### A. Desktop App shows "Invalid or Expired Pairing Code"
- **Cause**: Pairing codes expire after 15 minutes or become invalid once consumed.
- **Fix**: Open CSC Operator Portal → "Desktop Devices" → click "Generate New Code" and enter the fresh 6-digit PIN immediately.

### B. Unpaid orders do not show on Desktop
- **Expected Behavior**: Only `QUEUED` (paid or cash-confirmed) orders are transmitted to the desktop app.
- **Fix**: For counter cash orders, the operator must click "Mark Cash Received" in the CSC Portal to dispatch the job to the desktop queue.

### C. Razorpay Webhook indicates signature failure
- **Cause**: Raw request body parsing mismatch.
- **Fix**: Ensure `express.json` retains `req.rawBody` buffer as configured in `server/src/app.js` and verify `RAZORPAY_WEBHOOK_SECRET` matches your Razorpay Dashboard.

### D. Photo Stream returns 404
- **Cause**: The 10-minute post-completion retention window expired and the image was purged automatically by `cleanupService`.
- **Fix**: This is expected security behavior. Re-upload photo if reprint is required.
