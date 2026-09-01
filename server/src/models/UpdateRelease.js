const mongoose = require('mongoose');

const updateReleaseSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      trim: true // e.g. "1.1.0"
    },
    channel: {
      type: String,
      enum: ['stable', 'beta'],
      default: 'stable'
    },
    platform: {
      type: String,
      default: 'win32'
    },
    downloadUrl: {
      type: String,
      required: true,
      trim: true
    },
    releaseNotes: {
      type: String,
      default: ''
    },
    sha512: {
      type: String,
      default: ''
    },
    minimumSupportedVersion: {
      type: String,
      default: '1.0.0'
    },
    isMandatory: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

updateReleaseSchema.index({ channel: 1, isActive: 1, publishedAt: -1 });

module.exports = mongoose.model('UpdateRelease', updateReleaseSchema);
