# Double-Entry Credit System Specification — Prime ID Pro

---

## 1. Credit Mathematics & Accounting Rules

1. **Photo Cost**:
   - **1 Photo = 2 Credits (₹2)**
   - Multi-photo orders calculate credits as:
     $$\text{Total Credits} = \text{Photo Count} \times 2$$
     *(e.g., 5 photos = 10 credits deducted).*

2. **Non-Negative Balance Constraint**:
   - If `currentBalance < creditCost`, the transaction is rejected immediately with `INSUFFICIENT_CREDITS`.
   - Balances can never be negative under any condition.

3. **Atomic Operations**:
   - Wallet deductions use MongoDB atomic conditional updates (`findOneAndUpdate` with `$gte` check).

4. **Double-Entry Ledger Collection (`CreditTransaction`)**:
   - Every mutation records `balanceBefore`, `credits`, `balanceAfter`, `transactionType`, `referenceId`, and a unique `idempotencyKey`.

---

## 2. Dynamic Credit Packages

| Package Name | Price (INR) | Credits Credited | Photos Capacity | Bonus Credits |
|---|---|---|---|---|
| Starter Pack | ₹100 | 100 | 50 Photos | 0 |
| Growth Pack | ₹500 | 550 | 275 Photos | +50 Bonus |
| Studio Pro | ₹1,000 | 1,150 | 575 Photos | +150 Bonus |
| Enterprise Hub | ₹2,000 | 2,400 | 1,200 Photos | +400 Bonus |
