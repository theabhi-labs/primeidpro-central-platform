const QRCode = require('qrcode');
const StudioCenter = require('../models/StudioCenter');
const Job = require('../models/Job');
const Device = require('../models/Device');
const TransactionLedger = require('../models/TransactionLedger');
const creditLedgerService = require('../services/creditLedgerService');
const jobEngineService = require('../services/jobEngineService');
const ApiResponse = require('../utils/apiResponse');
const env = require('../config/env');
const { JOB_STATUS, DEVICE_STATUS } = require('../config/constants');
const logger = require('../utils/logger');
const crypto = require('crypto');

const _getCenterForUser = async (userId) => {
  return StudioCenter.findOne({ ownerId: userId });
};

const getDashboardStats = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) {
      return ApiResponse.error(res, 'Studio Center profile not found for this account', 404);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayJobsCount, pendingJobsCount, completedJobsCount, activeDevicesCount, todayRevenueAgg] = await Promise.all([
      Job.countDocuments({ centerId: center._id, createdAt: { $gte: todayStart } }),
      Job.countDocuments({
        centerId: center._id,
        jobStatus: { $in: [JOB_STATUS.DISPATCHED, JOB_STATUS.DOWNLOADING, JOB_STATUS.PROCESSING, JOB_STATUS.READY, JOB_STATUS.PRINTING] }
      }),
      Job.countDocuments({ centerId: center._id, jobStatus: JOB_STATUS.COMPLETED }),
      Device.countDocuments({
        centerId: center._id,
        status: DEVICE_STATUS.ACTIVE,
        lastSeenAt: { $gte: new Date(Date.now() - 3 * 60 * 1000) } // Online in last 3 mins
      }),
      Job.aggregate([
        { $match: { centerId: center._id, paymentStatus: 'PAID', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$priceInr' } } }
      ])
    ]);

    const todayRevenue = todayRevenueAgg.length > 0 ? todayRevenueAgg[0].total : 0;

    return ApiResponse.success(res, {
      center: {
        id: center._id,
        centerName: center.centerName,
        centerCode: center.centerCode,
        slug: center.slug,
        walletBalance: center.walletBalance
      },
      stats: {
        todayJobsCount,
        pendingJobsCount,
        completedJobsCount,
        activeDevicesCount,
        todayRevenue
      }
    });
  } catch (err) {
    next(err);
  }
};

const getJobsQueue = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const { status, search, page = 1, limit = 20 } = req.query;
    const query = { centerId: center._id };

    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        query.jobStatus = { $in: [JOB_STATUS.DISPATCHED, JOB_STATUS.DOWNLOADING, JOB_STATUS.PROCESSING, JOB_STATUS.READY, JOB_STATUS.PRINTING] };
      } else {
        query.jobStatus = status;
      }
    }

    if (search) {
      query.$or = [
        { jobCode: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return ApiResponse.paginate(res, jobs, total, page, limit, 'Jobs Queue');
  } catch (err) {
    next(err);
  }
};

const getJobDetails = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const job = await Job.findOne({ _id: req.params.id, centerId: center._id }).lean();
    if (!job) return ApiResponse.error(res, 'Job not found', 404);

    return ApiResponse.success(res, job);
  } catch (err) {
    next(err);
  }
};

const createWalkInOrder = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const { customerName, customerPhone, serviceType, copies, storageKey, photoUrl, priceInr } = req.body;

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const jobCode = `PIP-${new Date().getFullYear()}-${randomNum}`;
    const trackingPin = Math.floor(1000 + Math.random() * 9000).toString();

    const job = await jobEngineService.createJob({
      jobCode,
      trackingPin,
      customerId: null,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '9876543210',
      centerId: center._id,
      serviceType: serviceType || 'PASSPORT_PHOTO',
      serviceName: 'Walk-in Passport Photo Print',
      paperSize: '4x6',
      copies: copies || 8,
      priceInr: priceInr || 50,
      creditCost: 5,
      temporaryPhotoUrl: photoUrl || null,
      storageKey: storageKey || null,
      paymentMethod: 'CASH_AT_COUNTER'
    });

    return ApiResponse.success(res, job, 'Walk-in order created and dispatched to desktop printer', 201);
  } catch (err) {
    next(err);
  }
};

const getWalletAndLedger = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const { page = 1, limit = 20, type } = req.query;
    const history = await creditLedgerService.getCenterHistory(center._id, { page, limit, type });

    return ApiResponse.paginate(
      res,
      history.items,
      history.total,
      history.page,
      history.limit,
      'Wallet balance and ledger history'
    );
  } catch (err) {
    next(err);
  }
};

const generatePairingCode = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const code = crypto.randomInt(100000, 1000000).toString(); // 6 digits cryptographically secure
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    center.pairingCode = code;
    center.pairingCodeExpiresAt = expiresAt;
    await center.save();

    return ApiResponse.success(
      res,
      {
        centerCode: center.centerCode,
        centerName: center.centerName,
        pairingCode: code,
        expiresAt,
        expiresInSeconds: 900
      },
      'Pairing code generated successfully. Enter this code in your Prime ID Pro Electron desktop application.'
    );
  } catch (err) {
    next(err);
  }
};

const getKioskQr = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const kioskUrl = `${env.CLIENT_URL || env.DOMAIN || 'https://primeidpro.online'}/kiosk/${center.slug}`;
    const qrDataUrl = await QRCode.toDataURL(kioskUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0A0F1D',
        light: '#FFFFFF'
      }
    });

    return ApiResponse.success(res, {
      kioskUrl,
      qrDataUrl,
      centerName: center.centerName,
      centerCode: center.centerCode,
      slug: center.slug
    });
  } catch (err) {
    next(err);
  }
};

const getConnectedDevices = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const devices = await Device.find({ centerId: center._id }).sort({ lastSeenAt: -1 }).lean();

    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    const enrichedDevices = devices.map((d) => ({
      ...d,
      isOnline: d.lastSeenAt && new Date(d.lastSeenAt) >= threeMinutesAgo
    }));

    return ApiResponse.success(res, enrichedDevices, 'Connected Desktop Devices');
  } catch (err) {
    next(err);
  }
};

const revokeDevice = async (req, res, next) => {
  try {
    const center = await _getCenterForUser(req.user._id);
    if (!center) return ApiResponse.error(res, 'Studio Center not found', 404);

    const device = await Device.findOne({ _id: req.params.deviceId, centerId: center._id });
    if (!device) return ApiResponse.error(res, 'Device not found', 404);

    device.status = DEVICE_STATUS.REVOKED;
    await device.save();

    return ApiResponse.success(res, null, 'Device authorization revoked successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getJobsQueue,
  getJobDetails,
  createWalkInOrder,
  getWalletAndLedger,
  generatePairingCode,
  getKioskQr,
  getConnectedDevices,
  revokeDevice
};
