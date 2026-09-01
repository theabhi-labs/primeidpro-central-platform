/**
 * Phase 2B Comprehensive Financial Integrity & Razorpay Concurrency Test Suite
 * Validates all 16 critical financial and payment invariants
 */
const http = require('http');
const crypto = require('crypto');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { seedDefaultData } = require('../src/utils/seeder');

const User = require('../src/models/User');
const Center = require('../src/models/Center');
const Device = require('../src/models/Device');
const CreditWallet = require('../src/models/CreditWallet');
const CreditTransaction = require('../src/models/CreditTransaction');
const CreditPackage = require('../src/models/CreditPackage');
const Order = require('../src/models/Order');
const Job = require('../src/models/Job');
const Payment = require('../src/models/Payment');
const creditLedgerService = require('../src/services/creditLedgerService');
const { signToken, signDeviceToken } = require('../src/utils/jwt');

let server;
let baseUrl;

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

async function runFinancialTests() {
  console.log('\n================================================================');
  console.log('🧪 PHASE 2B: 16-POINT FINANCIAL INTEGRITY & CONCURRENCY TEST SUITE');
  console.log('================================================================\n');

  try {
    await connectDB();
    await seedDefaultData();

    server = http.createServer(app);
    await new Promise((res) => server.listen(0, res));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    const centerA = await Center.findOne({ centerCode: 'CSC-DL-1001' });
    const userA = await User.findOne({ email: 'csc@primeidpro.online' });
    const tokenA = signToken({ id: userA._id, role: userA.role, centerId: centerA._id });

    let demoDevice = await Device.findOne({ deviceId: 'PIP-DEV-DEMO-01' });
    const demoToken = signDeviceToken({ deviceId: demoDevice.deviceId, installationId: demoDevice.installationId, centerId: centerA._id.toString() });

    // Reset Center A Wallet to exactly 100 credits
    let wallet = await creditLedgerService.getOrCreateWallet(centerA._id);
    wallet.currentBalance = 100;
    wallet.lifetimePurchased = 100;
    wallet.lifetimeUsed = 0;
    await wallet.save();

    // ----------------------------------------------------------------
    // 1. Credit Deduction Math
    // ----------------------------------------------------------------
    console.log('📌 1. Credit deduction math (100 - 10 = 90)...');
    const debitRes1 = await creditLedgerService.debitJobPrint({
      centerId: centerA._id,
      jobId: `job_math_${Date.now()}`,
      photoCount: 5,
      creditCost: 10,
      idempotencyKey: `idemp_math_${Date.now()}`
    });
    assert(debitRes1.currentBalance === 90, `Wallet balance is exactly 90 credits (Got: ${debitRes1.currentBalance})`);

    // ----------------------------------------------------------------
    // 2. Duplicate Completion Single Deduction
    // ----------------------------------------------------------------
    console.log('📌 2. Duplicate completion single deduction...');
    const dupKey = `idemp_dup_${Date.now()}`;
    const d1 = await creditLedgerService.debitJobPrint({ centerId: centerA._id, jobId: 'job_dup', creditCost: 10, idempotencyKey: dupKey });
    assert(d1.currentBalance === 80, `Initial debit brought balance to 80 (Got: ${d1.currentBalance})`);
    const d2 = await creditLedgerService.debitJobPrint({ centerId: centerA._id, jobId: 'job_dup', creditCost: 10, idempotencyKey: dupKey });
    assert(d2.isDuplicate === true, 'Second debit identified as duplicate');
    assert(d2.currentBalance === 80, `Balance remained 80 on duplicate (Got: ${d2.currentBalance})`);

    // ----------------------------------------------------------------
    // 3. Wallet Recharge (+500 credits)
    // ----------------------------------------------------------------
    console.log('📌 3. Wallet recharge (+500 credits)...');
    const r1 = await creditLedgerService.rechargeWallet({
      centerId: centerA._id,
      amountInr: 500,
      credits: 550,
      paymentId: `pay_rech_${Date.now()}`,
      idempotencyKey: `wallet_recharge_test_${Date.now()}`
    });
    assert(r1.currentBalance === 630, `Wallet balance is 630 (80 + 550) (Got: ${r1.currentBalance})`);

    // ----------------------------------------------------------------
    // 4. Duplicate Wallet Recharge
    // ----------------------------------------------------------------
    console.log('📌 4. Duplicate wallet recharge...');
    const rKey = `wallet_recharge_dup_${Date.now()}`;
    await creditLedgerService.rechargeWallet({ centerId: centerA._id, amountInr: 100, credits: 100, paymentId: 'pay_d1', idempotencyKey: rKey });
    const rDup = await creditLedgerService.rechargeWallet({ centerId: centerA._id, amountInr: 100, credits: 100, paymentId: 'pay_d1', idempotencyKey: rKey });
    assert(rDup.isDuplicate === true, 'Duplicate recharge returned isDuplicate: true');

    // ----------------------------------------------------------------
    // 5. Duplicate Webhook
    // ----------------------------------------------------------------
    console.log('📌 5. Duplicate webhook single financial effect...');
    const wbEventId = `evt_fin_${Date.now()}`;
    const wbPayload = {
      id: wbEventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_wb_${Date.now()}`,
            order_id: `order_wb_${Date.now()}`,
            amount: 10000,
            notes: { type: 'WALLET_RECHARGE', centerId: centerA._id.toString(), credits: '100' }
          }
        }
      }
    };
    const h1 = await request('POST', '/api/v1/webhooks/razorpay', wbPayload);
    assert(h1.status === 200, 'First webhook delivery returned 200');
    const h2 = await request('POST', '/api/v1/webhooks/razorpay', wbPayload);
    assert(h2.data.isDuplicate === true, 'Duplicate webhook returned isDuplicate: true');

    // ----------------------------------------------------------------
    // 6. Verify + Webhook Order Case A (Verify then Webhook)
    // ----------------------------------------------------------------
    console.log('📌 6. Verify first, then Webhook (Order A)...');
    const orderIdA = `order_sim_caseA_${Date.now()}`;
    const payIdA = `pay_caseA_${Date.now()}`;
    
    // Seed pending payment record
    await Payment.create({
      razorpayOrderId: orderIdA,
      paymentType: 'WALLET_RECHARGE',
      centerId: centerA._id,
      amount: 500,
      credits: 550,
      status: 'PENDING'
    });

    const wBeforeA = (await CreditWallet.findOne({ centerId: centerA._id })).currentBalance;

    // Step 1: Verify Payment
    const verResA = await request('POST', '/api/v1/payments/verify-wallet-topup', {
      razorpay_order_id: orderIdA,
      razorpay_payment_id: payIdA,
      razorpay_signature: 'simulated_success_signature'
    }, { Authorization: `Bearer ${tokenA}` });
    assert(verResA.status === 200, 'Verify endpoint returned 200');
    assert(verResA.data.data.creditsAdded === 550, 'Verify endpoint added 550 credits');

    // Step 2: Webhook arrives later
    const wbResA = await request('POST', '/api/v1/webhooks/razorpay', {
      id: `evt_caseA_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: payIdA,
            order_id: orderIdA,
            amount: 50000,
            notes: { type: 'WALLET_RECHARGE', centerId: centerA._id.toString(), credits: '550' }
          }
        }
      }
    });
    assert(wbResA.status === 200, 'Webhook returned 200');

    const wAfterA = (await CreditWallet.findOne({ centerId: centerA._id })).currentBalance;
    assert(wAfterA === wBeforeA + 550, `Credits added exactly ONCE (+550, got ${wAfterA - wBeforeA})`);

    // ----------------------------------------------------------------
    // 7. Webhook + Verify Order Case B (Webhook then Verify)
    // ----------------------------------------------------------------
    console.log('📌 7. Webhook first, then Verify (Order B)...');
    const orderIdB = `order_sim_caseB_${Date.now()}`;
    const payIdB = `pay_caseB_${Date.now()}`;

    await Payment.create({
      razorpayOrderId: orderIdB,
      paymentType: 'WALLET_RECHARGE',
      centerId: centerA._id,
      amount: 1000,
      credits: 1150,
      status: 'PENDING'
    });

    const wBeforeB = (await CreditWallet.findOne({ centerId: centerA._id })).currentBalance;

    // Step 1: Webhook arrives first
    const wbResB = await request('POST', '/api/v1/webhooks/razorpay', {
      id: `evt_caseB_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: payIdB,
            order_id: orderIdB,
            amount: 100000,
            notes: { type: 'WALLET_RECHARGE', centerId: centerA._id.toString(), credits: '1150' }
          }
        }
      }
    });
    assert(wbResB.status === 200, 'Webhook first delivery returned 200');

    // Step 2: Verify endpoint called later
    const verResB = await request('POST', '/api/v1/payments/verify-wallet-topup', {
      razorpay_order_id: orderIdB,
      razorpay_payment_id: payIdB,
      razorpay_signature: 'simulated_success_signature'
    }, { Authorization: `Bearer ${tokenA}` });
    assert(verResB.status === 200, 'Verify endpoint returned 200');
    assert(verResB.data.data.isDuplicate === true, 'Verify flagged duplicate and did not double-credit');

    const wAfterB = (await CreditWallet.findOne({ centerId: centerA._id })).currentBalance;
    assert(wAfterB === wBeforeB + 1150, `Credits added exactly ONCE (+1150, got ${wAfterB - wBeforeB})`);

    // ----------------------------------------------------------------
    // 8. Client Credits Injection Prevention
    // ----------------------------------------------------------------
    console.log('📌 8. Client credits injection prevention...');
    const orderIdC = `order_sim_caseC_${Date.now()}`;
    const payIdC = `pay_caseC_${Date.now()}`;

    await Payment.create({
      razorpayOrderId: orderIdC,
      paymentType: 'WALLET_RECHARGE',
      centerId: centerA._id,
      amount: 100,
      credits: 100,
      status: 'PENDING'
    });

    const injRes = await request('POST', '/api/v1/payments/verify-wallet-topup', {
      razorpay_order_id: orderIdC,
      razorpay_payment_id: payIdC,
      razorpay_signature: 'simulated_success_signature',
      credits: 50000, // Attacker attempts to inject 50,000 credits
      amountInr: 10
    }, { Authorization: `Bearer ${tokenA}` });
    assert(injRes.status === 200, 'Verify endpoint returned 200');
    assert(injRes.data.data.creditsAdded === 100, `Server enforced authoritative 100 credits, ignoring 50,000 injection (Got: ${injRes.data.data.creditsAdded})`);

    // ----------------------------------------------------------------
    // 9. Client Amount Manipulation Prevention
    // ----------------------------------------------------------------
    console.log('📌 9. Client amount manipulation prevention...');
    const pkg = await CreditPackage.findOne({ price: 500 });
    const orderTopup = await request('POST', '/api/v1/payments/wallet-order', {
      packageId: pkg._id.toString(),
      amountInr: 1 // Attempt to force ₹1
    }, { Authorization: `Bearer ${tokenA}` });
    assert(orderTopup.status === 200, 'Topup order created');
    assert(orderTopup.data.data.amount === 50000, `Server enforced authoritative package price ₹500 (50000 paise), ignoring client ₹1`);
    assert(orderTopup.data.data.credits === 550, `Server enforced authoritative 550 credits`);

    // ----------------------------------------------------------------
    // 10. Insufficient Credits & Non-Negative Balance
    // ----------------------------------------------------------------
    console.log('📌 10. Insufficient credits & non-negative balance...');
    let tempCenter = await Center.create({
      ownerId: userA._id,
      centerName: 'Low Balance Studio',
      centerCode: `CSC-LOW-${Date.now()}`,
      address: 'Test',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      walletBalance: 5
    });
    let tempWallet = await creditLedgerService.getOrCreateWallet(tempCenter._id);
    tempWallet.currentBalance = 5;
    await tempWallet.save();

    let threw = false;
    try {
      await creditLedgerService.debitJobPrint({ centerId: tempCenter._id, jobId: 'low_job', creditCost: 20 });
    } catch (err) {
      threw = true;
      assert(err.code === 'INSUFFICIENT_CREDITS', `Cleanly rejected with INSUFFICIENT_CREDITS: ${err.message}`);
    }
    assert(threw === true, 'Deduction exceeding balance was rejected');
    const checkedLow = await CreditWallet.findOne({ centerId: tempCenter._id });
    assert(checkedLow.currentBalance === 5, `Balance remained 5 credits without going negative`);

    // ----------------------------------------------------------------
    // 11. Concurrent Wallet Deductions
    // ----------------------------------------------------------------
    console.log('📌 11. Concurrent wallet deductions race condition protection...');
    tempWallet.currentBalance = 10;
    await tempWallet.save();

    const debit1 = creditLedgerService.debitJobPrint({ centerId: tempCenter._id, jobId: 'conc_1', creditCost: 6, idempotencyKey: `conc_d1_${Date.now()}` });
    const debit2 = creditLedgerService.debitJobPrint({ centerId: tempCenter._id, jobId: 'conc_2', creditCost: 6, idempotencyKey: `conc_d2_${Date.now()}` });

    const results = await Promise.allSettled([debit1, debit2]);
    const successes = results.filter((r) => r.status === 'fulfilled');
    const rejections = results.filter((r) => r.status === 'rejected');

    assert(successes.length === 1, `Exactly ONE deduction of 6 credits succeeded (Successes: ${successes.length})`);
    assert(rejections.length === 1, `The second deduction of 6 credits was rejected for insufficient balance`);
    const finalConcWallet = await CreditWallet.findOne({ centerId: tempCenter._id });
    assert(finalConcWallet.currentBalance === 4, `Final balance is exactly 4 credits (10 - 6), never negative (Got: ${finalConcWallet.currentBalance})`);

    // ----------------------------------------------------------------
    // 12. Duplicate Payment Verification
    // ----------------------------------------------------------------
    console.log('📌 12. Duplicate payment verification...');
    const dupPayOrder = `order_sim_dup_${Date.now()}`;
    const dupPayId = `pay_dup_${Date.now()}`;
    await Payment.create({ razorpayOrderId: dupPayOrder, paymentType: 'WALLET_RECHARGE', centerId: centerA._id, amount: 100, credits: 100, status: 'PENDING' });

    const pv1 = await request('POST', '/api/v1/payments/verify-wallet-topup', { razorpay_order_id: dupPayOrder, razorpay_payment_id: dupPayId, razorpay_signature: 'simulated_success_signature' }, { Authorization: `Bearer ${tokenA}` });
    const pv2 = await request('POST', '/api/v1/payments/verify-wallet-topup', { razorpay_order_id: dupPayOrder, razorpay_payment_id: dupPayId, razorpay_signature: 'simulated_success_signature' }, { Authorization: `Bearer ${tokenA}` });
    assert(pv1.status === 200 && pv2.status === 200, 'Both verification calls return 200 OK');
    assert(pv2.data.data.isDuplicate === true, 'Second verification flagged as duplicate');

    // ----------------------------------------------------------------
    // 13. Invalid Razorpay Signature Rejection
    // ----------------------------------------------------------------
    console.log('📌 13. Invalid Razorpay signature rejection...');
    const invRes = await request('POST', '/api/v1/payments/verify-wallet-topup', {
      razorpay_order_id: 'order_live_real_123',
      razorpay_payment_id: 'pay_live_real_123',
      razorpay_signature: 'forged_fake_signature_hash'
    }, { Authorization: `Bearer ${tokenA}` });
    assert(invRes.status === 400, 'Invalid signature rejected with HTTP 400');

    // ----------------------------------------------------------------
    // 14. Correct Razorpay Order Response Payload
    // ----------------------------------------------------------------
    console.log('📌 14. Customer checkout Razorpay order response payload...');
    const orderRes = await request('POST', '/api/v1/orders/create', {
      centerId: centerA._id.toString(),
      customerName: 'Online Customer',
      customerPhone: '+919876543210',
      quantity: 1,
      paymentMethod: 'RAZORPAY',
      photos: [{ storageKey: 'temp/photo.jpg', photoUrl: '/stream/photo.jpg', copies: 1 }]
    });
    assert(orderRes.status === 201, 'Order created with 201');
    const rzpData = orderRes.data.data?.razorpayOrder || orderRes.data.razorpayOrder;
    assert(rzpData !== null, 'razorpayOrder is NOT null');
    assert(typeof rzpData.orderId === 'string', `razorpayOrder.orderId is valid string (${rzpData.orderId})`);
    assert(rzpData.amount > 0, `razorpayOrder.amount is valid positive integer (${rzpData.amount})`);

    // ----------------------------------------------------------------
    // 15. Historical Snapshot Preservation
    // ----------------------------------------------------------------
    console.log('📌 15. Historical pricing snapshot preservation...');
    const createdOrder = await Order.findOne({ orderId: orderRes.data.data.order.orderId });
    assert(createdOrder.unitPriceSnapshot > 0, 'unitPriceSnapshot is preserved');
    assert(createdOrder.platformFee === 2, 'platformFee is frozen at ₹2');

    // ----------------------------------------------------------------
    // 16. Refund / Reversal Compensating Ledger Integrity
    // ----------------------------------------------------------------
    console.log('📌 16. Refund/Reversal compensating transaction integrity...');
    const wBalBeforeRev = (await CreditWallet.findOne({ centerId: centerA._id })).currentBalance;
    const revRes = await creditLedgerService.recordTransaction({
      centerId: centerA._id,
      type: 'REFUND',
      amountInr: 20,
      credits: 20,
      referenceType: 'PAYMENT',
      referenceId: 'ref_123',
      idempotencyKey: `refund_test_${Date.now()}`,
      description: 'Customer refund credit compensation'
    });
    assert(revRes.currentBalance === wBalBeforeRev + 20, 'Compensating refund added 20 credits to balance');
    assert(revRes.ledger.transactionType === 'REFUND', 'Ledger record created with transactionType: REFUND');

    console.log('\n================================================================');
    console.log('🎉 ALL 16 PHASE 2B FINANCIAL INTEGRITY TESTS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ FINANCIAL TEST FAILED:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await disconnectDB();
  }
}

if (require.main === module) {
  runFinancialTests();
}

module.exports = { runFinancialTests };
