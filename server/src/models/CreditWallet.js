const mongoose = require('mongoose');

const CreditWalletSchema = new mongoose.Schema(
  {
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      required: true,
      unique: true,
      index: true
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, 'Credit balance cannot become negative']
    },
    lifetimePurchased: {
      type: Number,
      default: 0,
      min: 0
    },
    lifetimeUsed: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CreditWallet', CreditWalletSchema);
