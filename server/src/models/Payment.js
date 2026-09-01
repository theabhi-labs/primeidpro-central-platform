const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      sparse: true,
      index: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true
    },
    razorpaySignature: {
      type: String,
      trim: true
    },
    paymentType: {
      type: String,
      enum: ['CUSTOMER_ORDER', 'WALLET_RECHARGE'],
      default: 'CUSTOMER_ORDER',
      index: true
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditPackage'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    credits: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    verifiedAt: {
      type: Date
    },
    webhookEventId: {
      type: String,
      sparse: true,
      index: true
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

PaymentSchema.pre('save', function (next) {
  if (!this.paymentId) {
    this.paymentId = this.razorpayPaymentId || `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
