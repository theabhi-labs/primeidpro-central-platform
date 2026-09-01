# Razorpay Integration Guide — Prime ID Pro

---

## 1. Separation of Financial Channels

Prime ID Pro maintains strict architectural separation between customer photo print payments and CSC operator credit wallets:

1. **Customer Order Channel**:
   - Customer pays unit price + fixed ₹2 platform fee directly via Razorpay checkout.
   - Upon verification, the order transitions to `PAID` and the job transitions to `QUEUED`.
   - Money is settled directly to the platform account, and CSC wallet is debited 2 credits per photo printed.

2. **CSC Wallet Top-up Channel**:
   - Operator selects a Credit Package (`₹100`, `₹500`, `₹1000`, `₹2000`).
   - Razorpay order notes include `{ type: 'WALLET_RECHARGE', centerId, credits }`.
   - Upon verification or webhook receipt, credits are added to the studio wallet atomically.

---

## 2. Server-Side Signature Verification

```javascript
const crypto = require('crypto');

function verifyRazorpaySignature({ orderId, paymentId, signature, keySecret }) {
  const generated = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generated === signature;
}
```

---

## 3. Webhook Handling with Idempotency

Webhooks at `POST /api/v1/webhooks/razorpay` prevent duplicate execution by persisting every unique `eventId` into the `WebhookEvent` collection. If a retry is received, the server responds with `200 OK` and `{ isDuplicate: true }` without executing secondary credits or status mutations.
