const mongoose = require('mongoose');
const crypto = require('crypto');

const CenterSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    centerName: {
      type: String,
      required: [true, 'Center name is required'],
      trim: true,
      maxlength: 120
    },
    centerCode: {
      type: String,
      required: [true, 'Center code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    qrToken: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      default: () => crypto.randomBytes(16).toString('hex')
    },
    publicToken: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      default: () => crypto.randomBytes(12).toString('hex')
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'BLOCKED'],
      default: 'ACTIVE',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    serviceSettings: {
      serviceEnabled: { type: Boolean, default: true },
      pricePerPhoto: { type: Number, default: 7, min: 1 },
      minimumQuantity: { type: Number, default: 3, min: 1 },
      maximumQuantity: { type: Number, default: 20, min: 1 },
      quantityStep: { type: Number, default: 1, min: 1 },
      onlinePaymentEnabled: { type: Boolean, default: true },
      cashPaymentEnabled: { type: Boolean, default: true }
    },
    pairingCode: {
      type: String,
      trim: true
    },
    pairingCodeExpiresAt: {
      type: Date
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Method to regenerate QR token
CenterSchema.methods.regenerateQrToken = function () {
  this.qrToken = crypto.randomBytes(16).toString('hex');
  return this.qrToken;
};

// Method to generate pairing code
CenterSchema.methods.generatePairingCode = function (minutes = 15) {
  const code = crypto.randomInt(100000, 1000000).toString();
  this.pairingCode = code;
  this.pairingCodeExpiresAt = new Date(Date.now() + minutes * 60 * 1000);
  return code;
};

// Ensure slug generation before saving if not present
CenterSchema.pre('validate', function (next) {
  if (!this.slug && this.centerName) {
    const baseSlug = this.centerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  next();
});

const Center = mongoose.model('Center', CenterSchema);

module.exports = Center;
