const mongoose = require('mongoose');
const { DEVICE_STATUS } = require('../config/constants');

const deviceSchema = new mongoose.Schema(
  {
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      required: true,
      index: true
    },
    installationId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    deviceName: {
      type: String,
      default: 'Prime ID Pro Desktop Client',
      trim: true
    },
    hardwareFingerprint: {
      type: String,
      default: ''
    },
    authToken: {
      type: String,
      default: ''
    },
    authTokenHash: {
      type: String,
      default: ''
    },
    appVersion: {
      type: String,
      default: '1.0.0'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'REVOKED', 'BLOCKED', 'OFFLINE'],
      default: 'ACTIVE',
      index: true
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      default: ''
    },
    boundAt: {
      type: Date,
      default: Date.now
    },
    revokedAt: {
      type: Date
    },
    metrics: {
      jobsCompleted: { type: Number, default: 0 },
      lastPrintedAt: { type: Date, default: null },
      osPlatform: { type: String, default: 'win32' },
      printerName: { type: String, default: 'Default Windows Photo Printer' }
    }
  },
  {
    timestamps: true
  }
);

deviceSchema.index({ centerId: 1, status: 1 });

module.exports = mongoose.model('Device', deviceSchema);
