const mongoose = require('mongoose');

const UploadSessionSchema = new mongoose.Schema(
  {
    uploadSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    originalFileName: {
      type: String,
      trim: true,
      default: 'photo.jpg'
    },
    mimeType: {
      type: String,
      default: 'image/jpeg'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      index: true,
      sparse: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      index: true,
      sparse: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
      sparse: true
    },
    isClaimed: {
      type: Boolean,
      default: false,
      index: true
    },
    claimedAt: {
      type: Date
    },
    photoExpiresAt: {
      type: Date,
      required: true,
      index: true
    },
    isPurged: {
      type: Boolean,
      default: false,
      index: true
    },
    purgedAt: {
      type: Date
    },
    deleteRetryCount: {
      type: Number,
      default: 0
    },
    lastDeleteError: {
      type: String
    },
    nextDeleteRetryAt: {
      type: Date,
      index: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

UploadSessionSchema.index({ isClaimed: 1, isPurged: 1, photoExpiresAt: 1 });
UploadSessionSchema.index({ isPurged: 1, nextDeleteRetryAt: 1 });

module.exports = mongoose.model('UploadSession', UploadSessionSchema);
