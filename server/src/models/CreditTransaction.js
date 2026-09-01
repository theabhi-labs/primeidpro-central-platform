const mongoose = require('mongoose');
const crypto = require('crypto');

const CreditTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      default: () => `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      index: true
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    credits: {
      type: Number,
      required: true
    },
    balanceBefore: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    transactionType: {
      type: String,
      enum: ['PURCHASE', 'JOB_DEDUCTION', 'REFUND', 'ADMIN_ADJUSTMENT', 'REVERSAL', 'EXPIRED', 'WALLET_RECHARGE', 'JOB_DEBIT'],
      required: true,
      index: true
    },
    referenceType: {
      type: String,
      enum: ['ORDER', 'JOB', 'PAYMENT', 'ADMIN', 'SYSTEM'],
      default: 'SYSTEM'
    },
    referenceId: {
      type: String,
      trim: true
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for fast center statement queries
CreditTransactionSchema.index({ centerId: 1, createdAt: -1 });

module.exports = mongoose.model('CreditTransaction', CreditTransactionSchema);
