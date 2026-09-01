const razorpayService = require('../services/razorpayService');
const creditLedgerService = require('../services/creditLedgerService');
const Job = require('../models/Job');
const Order = require('../models/Order');
const Center = require('../models/Center');
const CreditPackage = require('../models/CreditPackage');
const Payment = require('../models/Payment');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const crypto = require('crypto');

class PaymentController {
  /**
   * Creates a Razorpay Order for a Customer Print Order
   * POST /api/v1/payments/create-order
   */
  async createPaymentOrder(req, res) {
    try {
      const { jobId, orderId } = req.body;

      let order = null;
      if (orderId) {
        order = await Order.findOne({
          $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }]
        });
      } else if (jobId) {
        order = await Order.findOne({
          $or: [{ jobId }, { _id: jobId.match(/^[0-9a-fA-F]{24}$/) ? jobId : null }]
        });
      }

      if (!order) {
        return ApiResponse.error(res, 'Order not found for payment initialization', 404);
      }

      // Authoritative database price (never trust client!)
      const amountInr = order.totalAmount;

      const rzpOrder = await razorpayService.createOrder({
        amountInr,
        receiptId: order.orderId,
        notes: {
          orderId: order.orderId,
          jobId: order.jobId?.toString(),
          centerId: order.centerId?.toString(),
          customerName: order.customerName
        }
      });

      if (!rzpOrder || !rzpOrder.id) {
        return ApiResponse.error(res, 'Failed to create payment order with Razorpay', 500);
      }

      order.razorpayOrderId = rzpOrder.id;
      await order.save();

      return ApiResponse.success(
        res,
        {
          orderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: razorpayService.keyId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail
        },
        'Payment order created'
      );
    } catch (err) {
      logger.error(`[PaymentController] Create order error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Verifies Razorpay checkout signature for Customer Print Order
   * POST /api/v1/payments/verify-payment
   */
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId, orderId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id) {
        return ApiResponse.error(res, 'Missing payment identifiers', 400);
      }

      // 1. Verify Cryptographic Signature
      const isValid = razorpayService.verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
      });

      if (!isValid) {
        return ApiResponse.error(res, 'Cryptographic payment signature verification failed', 400);
      }

      // 2. Fetch Order and Job
      let order = null;
      if (orderId) {
        order = await Order.findOne({
          $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }]
        });
      } else if (jobId) {
        order = await Order.findOne({
          $or: [{ jobId }, { _id: jobId.match(/^[0-9a-fA-F]{24}$/) ? jobId : null }]
        });
      } else {
        order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      }

      if (!order) {
        return ApiResponse.error(res, 'Associated print order not found', 404);
      }

      // 3. Mark Order as PAID and Job as QUEUED
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save();

      if (order.jobId) {
        const job = await Job.findById(order.jobId);
        if (job) {
          job.jobStatus = 'QUEUED';
          job.razorpayPaymentId = razorpay_payment_id;
          job.addStatusHistory('QUEUED', `Payment of ₹${order.totalAmount} captured via Razorpay (${razorpay_payment_id})`, 'CUSTOMER');
          await job.save();
        }
      }

      // 4. Create or update Payment record
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          paymentType: 'CUSTOMER_ORDER',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          orderId: order._id,
          centerId: order.centerId,
          amount: order.totalAmount,
          status: 'PAID',
          verifiedAt: new Date()
        },
        { upsert: true, new: true }
      );

      logger.info(`[PaymentController] Payment verified for Order #${order.orderId}. Job transitioned to QUEUED.`);

      return ApiResponse.success(
        res,
        {
          orderId: order.orderId,
          paymentStatus: 'PAID',
          jobStatus: 'QUEUED',
          verified: true
        },
        'Payment verified successfully and job dispatched to desktop print queue'
      );
    } catch (err) {
      logger.error(`[PaymentController] Verify payment error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Creates a Razorpay Order for CSC Studio Wallet Top-up
   * POST /api/v1/payments/wallet-order
   */
  async createWalletTopupOrder(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const { amountInr, packageId } = req.body;

      if (!centerId) {
        return ApiResponse.error(res, 'No studio center associated with this user', 403);
      }

      let rechargeAmount = Number(amountInr);
      let creditCount = rechargeAmount;

      // If package specified, look up authoritative database package
      if (packageId) {
        const pkg = await CreditPackage.findById(packageId);
        if (pkg && pkg.active) {
          rechargeAmount = pkg.price;
          creditCount = pkg.credits;
        }
      }

      if (!rechargeAmount || rechargeAmount < 10) {
        return ApiResponse.error(res, 'Minimum wallet top-up is ₹10', 400);
      }

      const receiptId = `RCPT_TOPUP_${Date.now()}`;
      const rzpOrder = await razorpayService.createOrder({
        amountInr: rechargeAmount,
        receiptId,
        notes: {
          type: 'WALLET_RECHARGE',
          centerId: centerId.toString(),
          credits: creditCount.toString(),
          userId: req.user?._id?.toString()
        }
      });

      if (!rzpOrder || !rzpOrder.id) {
        return ApiResponse.error(res, 'Failed to initialize wallet recharge order', 500);
      }

      // Create pending Payment record
      await Payment.create({
        razorpayOrderId: rzpOrder.id,
        paymentType: 'WALLET_RECHARGE',
        packageId: packageId || null,
        centerId,
        amount: rechargeAmount,
        currency: rzpOrder.currency || 'INR',
        credits: creditCount,
        status: 'PENDING',
        metadata: {
          receiptId,
          userId: req.user?._id?.toString()
        }
      });

      return ApiResponse.success(
        res,
        {
          orderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: razorpayService.keyId,
          credits: creditCount,
          centerId
        },
        'Wallet top-up order created'
      );
    } catch (err) {
      logger.error(`[PaymentController] Wallet topup order error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Verifies CSC Studio Wallet Top-up signature and credits wallet
   * POST /api/v1/payments/verify-wallet-topup
   */
  async verifyWalletTopup(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!centerId) {
        return ApiResponse.error(res, 'No studio center associated with this user', 403);
      }

      if (!razorpay_order_id || !razorpay_payment_id) {
        return ApiResponse.error(res, 'Missing payment identifiers for wallet top-up', 400);
      }

      // 1. Verify Cryptographic Signature
      const isValid = razorpayService.verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
      });

      if (!isValid) {
        return ApiResponse.error(res, 'Cryptographic payment signature verification failed', 400);
      }

      // 2. Resolve authoritative package and credits strictly from database (Ignore client body)
      let rechargeAmount = 0;
      let creditCount = 0;

      const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      if (paymentRecord) {
        rechargeAmount = paymentRecord.amount;
        creditCount = paymentRecord.credits;
      } else if (req.body.packageId) {
        const pkg = await CreditPackage.findById(req.body.packageId);
        if (pkg && pkg.active) {
          rechargeAmount = pkg.price;
          creditCount = pkg.credits;
        }
      }

      // Fallback only if no pre-saved record (e.g. direct amount verification)
      if (!rechargeAmount || !creditCount) {
        rechargeAmount = Number(paymentRecord?.amount || req.body.amountInr || 100);
        creditCount = Number(paymentRecord?.credits || rechargeAmount);
      }

      // 3. Unified Idempotency Key (Identical between frontend verify and backend webhook)
      const unifiedKey = `wallet_recharge_${razorpay_payment_id || razorpay_order_id}`;
      const ledgerRes = await creditLedgerService.rechargeWallet({
        centerId,
        amountInr: rechargeAmount,
        credits: creditCount,
        paymentId: razorpay_payment_id,
        idempotencyKey: unifiedKey,
        userId: req.user?._id
      });

      // 4. Record/Update Payment
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          paymentType: 'WALLET_RECHARGE',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          centerId,
          amount: rechargeAmount,
          credits: creditCount,
          status: 'PAID',
          verifiedAt: new Date(),
          idempotencyKey: unifiedKey
        },
        { upsert: true, new: true }
      );

      logger.info(`[PaymentController] Wallet recharged for Center ${centerId}: +${creditCount} credits. New Balance: ₹${ledgerRes.currentBalance}`);

      return ApiResponse.success(
        res,
        {
          creditsAdded: creditCount,
          newBalance: ledgerRes.currentBalance,
          paymentId: razorpay_payment_id,
          isDuplicate: ledgerRes.isDuplicate
        },
        `Wallet successfully recharged with ${creditCount} credits`
      );
    } catch (err) {
      logger.error(`[PaymentController] Verify wallet topup error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }
}

module.exports = new PaymentController();
