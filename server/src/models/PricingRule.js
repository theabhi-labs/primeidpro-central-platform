const mongoose = require('mongoose');
const { SERVICE_TYPES, PAPER_SIZES } = require('../config/constants');

const pricingRuleSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      enum: Object.values(SERVICE_TYPES),
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    dimensionsMm: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    aspectRatio: {
      type: Number,
      default: 1
    },
    defaultCopies: {
      type: Number,
      default: 8
    },
    paperSize: {
      type: String,
      enum: Object.values(PAPER_SIZES),
      default: PAPER_SIZES.FOUR_BY_SIX
    },
    customerPriceInr: {
      type: Number,
      required: true,
      min: 0
    },
    cscCreditCost: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
