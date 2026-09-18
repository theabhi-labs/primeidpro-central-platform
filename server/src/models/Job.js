const mongoose = require('mongoose');

const StatusHistoryItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String
    },
    source: {
      type: String,
      default: 'SYSTEM'
    }
  },
  { _id: false }
);

const JobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      sparse: true,
      index: true
    },
    jobCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      required: true,
      index: true
    },
    claimedByDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      index: true
    },
    serviceType: {
      type: String,
      enum: ['PASSPORT_PHOTO', 'VISA_PHOTO', 'STAMP_PHOTO', 'PVC_ID_CARD', 'CERTIFICATE', 'PHOTO', 'ID_CARD', 'PRINT_DOCUMENT', 'GENERAL_DOCUMENT', 'CUSTOM_ID'],
      default: 'PASSPORT_PHOTO',
      index: true
    },
    templateId: { type: String, default: 'india', index: true },
    paperSize: { type: String, default: 'A4' },
    layoutId: { type: String, default: 'A4' },
    dimensions: { width: Number, height: Number, unit: { type: String, default: 'mm' } },
    processingOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
    printOptions: {
      margins: { top: Number, bottom: Number, left: Number, right: Number },
      spacingMm: { type: Number, default: 2.0 },
      cutMarks: { type: Boolean, default: true },
      border: { type: Boolean, default: true },
      orientation: { type: String, default: 'portrait' }
    },
    source: { type: String, default: 'ONLINE' },
    serviceName: {
      type: String,
      default: 'Indian Passport (35x45mm)'
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      trim: true
    },
    customerEmail: {
      type: String,
      trim: true
    },
    copies: {
      type: Number,
      default: 8,
      min: 1
    },
    priceInr: {
      type: Number,
      required: true,
      min: 0
    },
    creditRateSnapshot: {
      type: Number,
      default: 2,
      min: 0
    },
    creditCost: {
      type: Number,
      default: 10,
      min: 0
    },
    jobStatus: {
      type: String,
      enum: [
        'CREATED',
        'QUEUED',
        'SENT_TO_APP',
        'ACKNOWLEDGED',
        'DOWNLOADING',
        'PROCESSING',
        'READY',
        'PRINTING',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
      ],
      default: 'CREATED',
      index: true
    },
    statusHistory: [StatusHistoryItemSchema],
    itemsCount: {
      type: Number,
      default: 1
    },
    itemsData: [
      {
        photoIndex: Number,
        storageKey: String,
        photoUrl: String,
        originalFileName: String,
        cropSettings: mongoose.Schema.Types.Mixed,
        backgroundColor: String,
        copies: Number
      }
    ],
    temporaryStorageKey: {
      type: String
    },
    temporaryPhotoUrl: {
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
    trackingPin: {
      type: String
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    photoExpiresAt: {
      type: Date,
      index: true
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
    },
    nextDeleteRetryAt: {
      type: Date,
      index: true,
      sparse: true
    },
    isLedgerDebited: {
      type: Boolean,
      default: false,
      index: true
    },
    claimedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

JobSchema.pre('save', function (next) {
  if (!this.jobId) {
    this.jobId = this.jobCode;
  }
  next();
});

JobSchema.index({ centerId: 1, jobStatus: 1, createdAt: -1 });
JobSchema.index({ isPhotoPurged: 1, photoExpiresAt: 1 });

JobSchema.methods.addStatusHistory = function (status, message, source = 'SYSTEM') {
  this.jobStatus = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    message: message || `Job transitioned to ${status}`,
    source
  });
};

module.exports = mongoose.model('Job', JobSchema);
