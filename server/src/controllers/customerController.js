const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const storageService = require('../services/storageService');
const razorpayService = require('../services/razorpayService');
const jobEngineService = require('../services/jobEngineService');
const Job = require('../models/Job');
const Center = require('../models/Center');
const PricingRule = require('../models/PricingRule');
const ApiResponse = require('../utils/apiResponse');
const { DEFAULT_TEMPLATES, SERVICE_TYPES, PAPER_SIZES } = require('../config/constants');
const logger = require('../utils/logger');

// Multer memory storage for direct buffer upload to storageService
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are supported'));
    }
  }
});

const crypto = require('crypto');
const env = require('../config/env');
const UploadSession = require('../models/UploadSession');

const uploadTempPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'No photo file provided in request (field: photo)', 400);
    }

    const { uploadSessionId, storageKey, photoUrl, sizeBytes, expiresInMinutes } =
      await storageService.uploadTemporaryPhoto(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        { centerId: req.body.centerId }
      );

    return ApiResponse.success(
      res,
      {
        uploadSessionId,
        storageKey,
        photoUrl,
        sizeBytes,
        expiresInMinutes
      },
      'Photo uploaded to temporary object storage successfully'
    );
  } catch (err) {
    next(err);
  }
};

const getPhotoStream = async (req, res) => {
  try {
    // 1. Extract storageKey from various possible param positions
    let rawKey = req.params.storageKey || req.params[0] || req.params['0'] || req.query.storageKey || req.query.key || '';
    
    // If not captured by params, parse directly from req.originalUrl or req.path
    if (!rawKey) {
      const match = req.originalUrl.match(/\/(photo-stream|stream)\/(.+?)(\?|$)/i);
      if (match && match[2]) {
        rawKey = match[2];
      }
    }

    if (!rawKey) {
      return res.status(400).send('Storage key parameter is required.');
    }

    const decodedKey = decodeURIComponent(rawKey).trim();
    const cleanStorageKey = decodedKey.replace(/\\/g, '/').replace(/^\/+/, '');
    const { exp, sig } = req.query;

    let isAuthorized = false;

    // 1. HMAC Signature check if provided
    if (exp && sig) {
      const jwtSecret = env.JWT_SECRET || 'primeidpro_super_secret_jwt_key_2026_production_grade_9988';
      const expectedSig = crypto
        .createHmac('sha256', jwtSecret)
        .update(`${cleanStorageKey}:${exp}`)
        .digest('hex');

      const expectedSigRaw = crypto
        .createHmac('sha256', jwtSecret)
        .update(`${decodedKey}:${exp}`)
        .digest('hex');

      if ((sig === expectedSig || sig === expectedSigRaw) && Date.now() <= (Number(exp) + 3600000)) { // 1h clock skew grace
        isAuthorized = true;
      }
    }

    // 2. Database validation fallback: check if storageKey belongs to any active Job or UploadSession
    if (!isAuthorized) {
      const keyVariants = [cleanStorageKey, `/${cleanStorageKey}`, decodedKey];
      const [session, job] = await Promise.all([
        UploadSession.findOne({ storageKey: { $in: keyVariants }, isPurged: false }),
        Job.findOne({
          $or: [
            { temporaryStorageKey: { $in: keyVariants } },
            { storageKey: { $in: keyVariants } },
            { 'itemsData.storageKey': { $in: keyVariants } }
          ],
          isPhotoPurged: false
        })
      ]);

      if (session || job) {
        isAuthorized = true;
      }
    }

    // 3. Device header fallback if requested from connected desktop client
    if (!isAuthorized && (req.headers['x-device-token'] || req.headers['authorization'] || req.headers['x-device-id'])) {
      isAuthorized = true;
    }

    // 4. If key matches temporary photo pattern and file exists on disk/driver, allow viewing preview
    if (!isAuthorized && (cleanStorageKey.startsWith('temp-photos/') || cleanStorageKey.startsWith('photos/'))) {
      const exists = await storageService.exists(cleanStorageKey);
      if (exists) {
        isAuthorized = true;
      }
    }

    // 5. Fetch stream from storage driver
    const objectData = await storageService.getObject(cleanStorageKey);
    if (!objectData || !objectData.stream) {
      return res.status(404).send('Photo not found or has expired and was automatically purged.');
    }

    res.setHeader('Content-Type', objectData.contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (objectData.contentLength) {
      res.setHeader('Content-Length', objectData.contentLength);
    }
    objectData.stream.pipe(res);
  } catch (err) {
    if (err.code === 'ENOENT' || err.name === 'NoSuchKey') {
      return res.status(404).send('Photo not found or has expired and was automatically purged.');
    }
    logger.error('[CustomerController] Photo stream error:', err);
    res.status(500).send('Error streaming photo');
  }
};

const getServiceTemplates = async (req, res, next) => {
  try {
    let rules = await PricingRule.find({ status: 'ACTIVE' }).lean();
    if (!rules || rules.length === 0) {
      rules = DEFAULT_TEMPLATES;
    }
    return ApiResponse.success(res, rules, 'Available ID & Photo templates');
  } catch (err) {
    next(err);
  }
};

const listCenters = async (req, res, next) => {
  try {
    const { search, city, state, page = 1, limit = 20 } = req.query;
    const query = { status: 'ACTIVE' };

    if (search) {
      query.$or = [
        { centerName: { $regex: search, $options: 'i' } },
        { centerCode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { pincode: { $regex: search, $options: 'i' } }
      ];
    }
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };

    const total = await Center.countDocuments(query);
    const centers = await Center.find(query)
      .select('-pairingCode')
      .sort({ centerName: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return ApiResponse.paginate(res, centers, total, page, limit, 'Active CSC Studios');
  } catch (err) {
    next(err);
  }
};

const getCenterBySlugOrCode = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const center = await Center.findOne({
      $or: [
        { qrToken: identifier },
        { slug: identifier.toLowerCase() },
        { centerCode: identifier.toUpperCase() },
        { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }
      ],
      status: 'ACTIVE'
    }).select('-pairingCode');

    if (!center) {
      return ApiResponse.error(res, 'Studio Center not found or inactive', 404);
    }

    return ApiResponse.success(res, center, 'Studio Center details');
  } catch (err) {
    next(err);
  }
};

const createCustomerOrder = async (req, res, next) => {
  try {
    const {
      centerId,
      customerName,
      customerPhone,
      customerEmail,
      serviceType = 'PASSPORT_PHOTO',
      copies,
      storageKey,
      photoUrl,
      photos = [],
      items = [],
      cropSettings,
      backgroundColor,
      paymentMethod = 'RAZORPAY'
    } = req.body;

    // Validate center exists
    const center = await Center.findById(centerId);
    if (!center || center.status !== 'ACTIVE') {
      return ApiResponse.error(res, 'Selected Studio Center is not available', 400);
    }

    // Determine price & credit cost
    const pricing = await PricingRule.findOne({ serviceType, status: 'ACTIVE' });
    const template = pricing || DEFAULT_TEMPLATES.find((t) => t.serviceType === serviceType) || DEFAULT_TEMPLATES[0];

    const allItems = Array.isArray(photos) && photos.length > 0
      ? photos
      : (Array.isArray(items) && items.length > 0 ? items : []);

    const itemCount = allItems.length > 0 ? allItems.length : 1;
    const baseCopies = Number(copies) || template.defaultCopies || 1;
    const unitPrice = template.customerPriceInr;
    const priceInr = serviceType === 'PRINT_DOCUMENT' || serviceType === 'ID_CARD'
      ? itemCount * baseCopies * unitPrice
      : unitPrice;

    const creditCost = (template.cscCreditCost || 1) * itemCount;

    // Generate unique Job Code & 4-digit PIN
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const jobCode = `PIP-${new Date().getFullYear()}-${randomNum}`;
    const trackingPin = Math.floor(1000 + Math.random() * 9000).toString();

    // Create Razorpay order if method is RAZORPAY
    let razorpayOrder = null;
    if (paymentMethod === 'RAZORPAY') {
      razorpayOrder = await razorpayService.createOrder({
        amountInr: priceInr,
        receiptId: jobCode,
        notes: {
          jobCode,
          customerName,
          customerPhone,
          centerName: center.centerName
        }
      });
    }

    const firstPhotoUrl = photoUrl || (allItems.length > 0 ? (allItems[0].photoUrl || allItems[0].downloadUrl) : '');
    const firstStorageKey = storageKey || (allItems.length > 0 ? allItems[0].storageKey : '');

    // Format itemsData
    const itemsData = allItems.map((it, idx) => ({
      photoIndex: it.photoIndex || (idx + 1),
      storageKey: it.storageKey || '',
      photoUrl: it.photoUrl || it.downloadUrl || '',
      originalFileName: it.originalFileName || `file_${idx + 1}.jpg`,
      cropSettings: it.cropSettings || {},
      backgroundColor: it.backgroundColor || '#FFFFFF',
      copies: it.copies || baseCopies
    }));

    // Create Job in Database
    const job = await jobEngineService.createJob({
      jobCode,
      trackingPin,
      customerId: req.user ? req.user._id : null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      centerId: center._id,
      serviceType: template.serviceType || serviceType,
      serviceName: template.name,
      paperSize: template.paperSize || PAPER_SIZES.A4,
      copies: baseCopies,
      priceInr,
      creditCost,
      temporaryPhotoUrl: firstPhotoUrl,
      storageKey: firstStorageKey,
      itemsData,
      itemsCount: itemsData.length || 1,
      cropSettings: cropSettings || {},
      backgroundColor: backgroundColor || '#FFFFFF',
      paymentMethod,
      razorpayOrderId: razorpayOrder ? razorpayOrder.id : null
    });

    if (firstStorageKey) {
      await storageService.claimUploadSession(firstStorageKey, {
        jobId: job._id,
        centerId: center._id
      });
    }

    return ApiResponse.success(
      res,
      {
        job: {
          id: job._id,
          jobCode: job.jobCode,
          trackingPin: job.trackingPin,
          customerName: job.customerName,
          serviceName: job.serviceName,
          priceInr: job.priceInr,
          copies: job.copies,
          jobStatus: job.jobStatus,
          paymentStatus: job.paymentStatus,
          centerName: center.centerName,
          centerCode: center.centerCode
        },
        razorpayOrder: razorpayOrder
          ? {
              orderId: razorpayOrder.id,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              keyId: razorpayService.keyId
            }
          : null
      },
      'Order created successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    const { jobCode, trackingPin } = req.query;

    if (!jobCode) {
      return ApiResponse.error(res, 'Job code is required for tracking', 400);
    }

    const query = { jobCode: jobCode.toUpperCase().trim() };
    if (trackingPin) {
      query.trackingPin = trackingPin.trim();
    }

    const job = await Job.findOne(query)
      .populate('centerId', 'centerName centerCode address phone city state')
      .lean();

    if (!job) {
      return ApiResponse.error(res, 'Order not found. Please verify your Job Code and 4-digit PIN.', 404);
    }

    // Build timeline progress
    const steps = [
      { key: 'CREATED', label: 'Order Received', done: true },
      {
        key: 'PAID',
        label: 'Payment Verified',
        done: job.paymentStatus === 'PAID'
      },
      {
        key: 'DISPATCHED',
        label: 'Dispatched to Studio',
        done: ['DISPATCHED', 'DOWNLOADING', 'PROCESSING', 'READY', 'PRINTING', 'COMPLETED'].includes(job.jobStatus)
      },
      {
        key: 'PROCESSING',
        label: 'AI Background & Face Mesh',
        done: ['PROCESSING', 'READY', 'PRINTING', 'COMPLETED'].includes(job.jobStatus)
      },
      {
        key: 'PRINTING',
        label: 'Printing on Studio Hardware',
        done: ['PRINTING', 'COMPLETED'].includes(job.jobStatus)
      },
      {
        key: 'COMPLETED',
        label: 'Ready for Pickup / Done',
        done: job.jobStatus === 'COMPLETED'
      }
    ];

    return ApiResponse.success(res, {
      job: {
        id: job._id,
        jobCode: job.jobCode,
        customerName: job.customerName,
        serviceName: job.serviceName,
        copies: job.copies,
        priceInr: job.priceInr,
        jobStatus: job.jobStatus,
        paymentStatus: job.paymentStatus,
        temporaryPhotoUrl: !job.isPhotoPurged ? job.temporaryPhotoUrl : null,
        isPhotoPurged: job.isPhotoPurged,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        center: job.centerId,
        steps,
        statusHistory: job.statusHistory
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upload,
  uploadTempPhoto,
  getPhotoStream,
  getServiceTemplates,
  listCenters,
  getCenterBySlugOrCode,
  createCustomerOrder,
  trackOrder
};
