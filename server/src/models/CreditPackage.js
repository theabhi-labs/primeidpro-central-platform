const mongoose = require('mongoose');

const CreditPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 1
    },
    credits: {
      type: Number,
      required: true,
      min: 1
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

CreditPackageSchema.index({ active: 1, displayOrder: 1 });

module.exports = mongoose.model('CreditPackage', CreditPackageSchema);
