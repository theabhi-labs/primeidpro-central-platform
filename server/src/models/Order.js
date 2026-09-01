const mongoose = require('mongoose');
const crypto = require('crypto');

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    publicOrderToken: {
      type: String,
      default: () => crypto.randomBytes(12).toString('hex'),
      sparse: true,
      index: true
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      trim: true,
      index: true
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    customerSessionId: {
      type: String,
      trim: true
    },
    qrTokenReference: {
      type: String,
      trim: true,
      index: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      index: true
    },
    serviceType: {
      type: String,
      enum: ['PASSPORT_PHOTO', 'VISA_PHOTO', 'STAMP_PHOTO', 'PVC_ID_CARD', 'CERTIFICATE'],
      default: 'PASSPORT_PHOTO',
      index: true
    },
    serviceName: {
      type: String,
      default: 'Indian Passport (35x45mm)'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0
    },
    platformFee: {
      type: Number,
      default: 2,
      min: 0
    },
    gatewayFee: {
      type: Number,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['RAZORPAY', 'CASH'],
      default: 'RAZORPAY',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED', 'CASH_PENDING'],
      default: 'PENDING',
      index: true
    },
    orderStatus: {
      type: String,
      enum: ['CREATED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'CREATED',
      index: true
    },
    cashReceivedAt: {
      type: Date
    },
    cashReceivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      trim: true
    },
    trackingPin: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString()
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ centerId: 1, createdAt: -1 });
OrderSchema.index({ centerId: 1, paymentStatus: 1, orderStatus: 1 });

module.exports = mongoose.model('Order', OrderSchema);
