const crypto = require('crypto');
const Razorpay = require('razorpay');
const env = require('../config/env');
const logger = require('../utils/logger');

class RazorpayService {
  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID;
    this.keySecret = env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
    this.isTestMode = env.PAYMENT_TEST_MODE;

    try {
      this.instance = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret
      });
      logger.info(`[RazorpayService] Initialized with Key ID: ${this.keyId} (Test Mode: ${this.isTestMode})`);
    } catch (err) {
      logger.warn('[RazorpayService] Razorpay SDK init failed with provided keys, using mock/simulation handler:', err.message);
      this.instance = null;
    }
  }

  /**
   * Creates a Razorpay Order
   * @param {Object} params
   * @param {number} params.amountInr - Amount in INR (e.g. 50)
   * @param {string} params.receiptId - Unique receipt/order code
   * @param {Object} [params.notes] - Additional metadata
   * @returns {Promise<Object>} Razorpay order object
   */
  async createOrder({ amountInr, receiptId, notes = {} }) {
    const amountInPaise = Math.round(amountInr * 100);

    // In production, strictly enforce live Razorpay API order creation
    if (this.instance && (!this.keyId.includes('rzp_test_PrimeIdProSandbox') || env.NODE_ENV === 'production')) {
      try {
        const order = await this.instance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            platform: 'Prime ID Pro Central Web',
            ...notes
          }
        });
        return order;
      } catch (err) {
        logger.error('[RazorpayService] Failed to create live order from Razorpay API:', err);
        if (env.NODE_ENV === 'production') {
          throw new Error(`Razorpay gateway order creation failed: ${err.message}`);
        }
      }
    }

    // Simulated sandbox order for local dev & testing only (isolated from production)
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    logger.info(`[RazorpayService] Generated simulated test order: ${simulatedOrderId} for ₹${amountInr}`);
    return {
      id: simulatedOrderId,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      attempts: 0,
      notes,
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Cryptographically verifies the Razorpay payment signature
   * @param {Object} params
   * @param {string} params.orderId - razorpay_order_id
   * @param {string} params.paymentId - razorpay_payment_id
   * @param {string} params.signature - razorpay_signature
   * @returns {boolean}
   */
  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    // Allow simulated orders strictly in non-production test mode
    if (
      env.NODE_ENV !== 'production' &&
      env.PAYMENT_TEST_MODE &&
      orderId.startsWith('order_sim_') &&
      signature === 'simulated_success_signature'
    ) {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;
      if (!isValid) {
        logger.warn(`[RazorpayService] Signature verification mismatch for order: ${orderId}`);
      }
      return isValid;
    } catch (err) {
      logger.error('[RazorpayService] Error in verifyPaymentSignature:', err);
      return false;
    }
  }

  /**
   * Cryptographically verifies Razorpay Webhook signature
   * @param {Object} params
   * @param {string|Buffer} params.rawBody - Raw webhook request payload string
   * @param {string} params.signature - X-Razorpay-Signature header
   * @returns {boolean}
   */
  verifyWebhookSignature({ rawBody, signature }) {
    if (!rawBody || !signature) return false;

    // Test bypass in dev/test simulation only
    if (
      env.NODE_ENV !== 'production' &&
      env.PAYMENT_TEST_MODE &&
      signature === 'simulated_webhook_signature'
    ) {
      return true;
    }

    try {
      const secret = this.webhookSecret || this.keySecret;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      return expectedSignature === signature;
    } catch (err) {
      logger.error('[RazorpayService] Webhook signature verification error:', err);
      return false;
    }
  }
}

module.exports = new RazorpayService();
