const mongoose = require('mongoose');

const WebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    providerEventId: {
      type: String,
      sparse: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed
    },
    processed: {
      type: Boolean,
      default: false,
      index: true
    },
    processedAt: {
      type: Date
    },
    error: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

WebhookEventSchema.pre('save', function (next) {
  if (!this.providerEventId) {
    this.providerEventId = this.eventId;
  }
  next();
});

module.exports = mongoose.model('WebhookEvent', WebhookEventSchema);
