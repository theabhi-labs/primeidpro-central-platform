const mongoose = require('mongoose');

const JobItemSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    photoIndex: {
      type: Number,
      default: 1
    },
    originalFileName: {
      type: String,
      trim: true
    },
    storageKey: {
      type: String,
      required: true
    },
    photoUrl: {
      type: String
    },
    cropSettings: {
      zoom: { type: Number, default: 1 },
      rotation: { type: Number, default: 0 },
      aspectRatio: { type: Number, default: 0.777 },
      cropX: { type: Number, default: 0 },
      cropY: { type: Number, default: 0 }
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    copies: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['PENDING', 'DOWNLOADING', 'PROCESSED', 'PRINTED', 'FAILED'],
      default: 'PENDING'
    },
    isPhotoPurged: {
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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('JobItem', JobItemSchema);
