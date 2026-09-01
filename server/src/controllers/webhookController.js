const crypto = require('crypto');
const Order = require('../models/Order');
const Job = require('../models/Job');
const Payment = require('../models/Payment');
const WebhookEvent = require('../models/WebhookEvent');
const creditLedgerService = require('../services/creditLedgerService');
const razorpayService = require('../services/razorpayService');
const env = require('../config/env');
const logger = require('../utils/logger');

class WebhookController {
  /**
   * Handles incoming Razorpay Webhook Events with signature verification and idempotency
   * POST /api/v1/webhooks/razorpay
   */
  async handleRazorpayWebhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.rawBody || JSON.stringify(req.body);

      // 1. Cryptographic Signature Verification
      const isValid = razorpayService.verifyWebhookSignature({ rawBody, signature });
      if (!isValid && (!env.PAYMENT_TEST_MODE || env.NODE_ENV === 'production')) {
        logger.warn('[Webhook] Invalid Razorpay webhook signature received');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }

      const event = req.body;
      const eventId = event?.id || `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const eventType = event?.event || 'payment.captured';

      logger.info(`[Webhook] Processing Razorpay event: ${eventType} (ID: ${eventId})`);

      // 2. Idempotency Guard: Prevent Duplicate Webhook Execution
      const existingEvent = await WebhookEvent.findOne({ eventId });
      if (existingEvent && existingEvent.processed) {
        logger.info(`[Webhook] Duplicate webhook event ignored: ${eventId}`);
        return res.status(200).json({ success: true, isDuplicate: true, message: 'Event already processed' });
      }

      // Record event entry
      const webhookRecord = existingEvent || (await WebhookEvent.create({
        eventId,
        providerEventId: eventId,
        eventType,
        payload: event,
        processed: false
      }));

      // 3. Process Event Types
      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const paymentEntity = event?.payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id || event?.payload?.order?.entity?.id;
        const razorpayPaymentId = paymentEntity?.id || `pay_${Date.now()}`;
        const amountInr = (paymentEntity?.amount || 0) / 100;
        const notes = paymentEntity?.notes || {};

        if (razorpayOrderId) {
          // Check if this is a Customer Order Payment
          const order = await Order.findOne({ razorpayOrderId });
          if (order && order.paymentStatus !== 'PAID') {
            order.paymentStatus = 'PAID';
            order.orderStatus = 'CONFIRMED';
            order.razorpayPaymentId = razorpayPaymentId;
            await order.save();

            // Transition associated Job to QUEUED
            if (order.jobId) {
              const job = await Job.findById(order.jobId);
              if (job) {
                job.jobStatus = 'QUEUED';
                job.razorpayPaymentId = razorpayPaymentId;
                job.addStatusHistory('QUEUED', `Payment of ₹${order.totalAmount} captured via Razorpay (${razorpayPaymentId})`, 'WEBHOOK');
                await job.save();
              }
            }

            // Update or create Payment record
            await Payment.findOneAndUpdate(
              { razorpayOrderId },
              {
                paymentId: razorpayPaymentId,
                razorpayPaymentId,
                status: 'PAID',
                amount: order.totalAmount,
                verifiedAt: new Date(),
                webhookEventId: eventId
              },
              { upsert: true, new: true }
            );

            logger.info(`[Webhook] Order #${order.orderId} marked PAID via Webhook`);
          }

          // Check if this is a CSC Wallet Recharge Payment
          if (notes.type === 'WALLET_RECHARGE' || notes.centerId) {
            const centerId = notes.centerId;
            let credits = Number(notes.credits) || amountInr;
            let finalAmount = amountInr;

            // Fetch authoritative values from Payment record if available
            const existingPayment = await Payment.findOne({ razorpayOrderId });
            if (existingPayment) {
              credits = existingPayment.credits || credits;
              finalAmount = existingPayment.amount || finalAmount;
            }

            const unifiedKey = `wallet_recharge_${razorpayPaymentId || razorpayOrderId}`;

            await creditLedgerService.rechargeWallet({
              centerId,
              amountInr: finalAmount,
              credits,
              paymentId: razorpayPaymentId,
              idempotencyKey: unifiedKey
            });

            await Payment.findOneAndUpdate(
              { razorpayOrderId },
              {
                paymentId: razorpayPaymentId,
                paymentType: 'WALLET_RECHARGE',
                razorpayPaymentId,
                centerId,
                status: 'PAID',
                amount: finalAmount,
                credits,
                verifiedAt: new Date(),
                webhookEventId: eventId,
                idempotencyKey: unifiedKey
              },
              { upsert: true, new: true }
            );

            logger.info(`[Webhook] CSC Wallet recharged with ${credits} credits for Center ${centerId}`);
          }
        }
      }

      // 4. Mark Webhook as Processed
      webhookRecord.processed = true;
      webhookRecord.processedAt = new Date();
      await webhookRecord.save();

      return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (err) {
      logger.error(`[Webhook] Error processing webhook: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new WebhookController();
