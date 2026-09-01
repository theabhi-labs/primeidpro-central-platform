const Center = require('../models/Center');
const User = require('../models/User');
const Device = require('../models/Device');
const Job = require('../models/Job');
const Order = require('../models/Order');
const CreditWallet = require('../models/CreditWallet');
const CreditTransaction = require('../models/CreditTransaction');
const CreditPackage = require('../models/CreditPackage');
const PricingRule = require('../models/PricingRule');
const UpdateRelease = require('../models/UpdateRelease');
const AuditLog = require('../models/AuditLog');
const Payment = require('../models/Payment');
const storageService = require('../services/storageService');
const creditLedgerService = require('../services/creditLedgerService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class AdminController {
  /**
   * Executive Analytics Dashboard
   * GET /api/v1/admin/dashboard (or /api/v1/admin/analytics)
   */
  async getDashboardAnalytics(req, res) {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [
        totalCenters,
        activeCenters,
        suspendedCenters,
        totalDevices,
        activeDevices,
        todayOrders,
        todayRevenueAgg,
        totalRevenueAgg,
        totalCreditsPurchasedAgg,
        totalCreditsUsedAgg,
        pendingJobs,
        failedJobs,
        completedJobs,
        recentJobs,
        recentAuditLogs
      ] = await Promise.all([
        Center.countDocuments(),
        Center.countDocuments({ status: 'ACTIVE' }),
        Center.countDocuments({ status: { $in: ['SUSPENDED', 'BLOCKED'] } }),
        Device.countDocuments(),
        Device.countDocuments({ status: 'ACTIVE', lastSeenAt: { $gte: new Date(Date.now() - 180000) } }),
        Order.countDocuments({ createdAt: { $gte: startOfDay } }),
        Order.aggregate([
          { $match: { paymentStatus: 'PAID', createdAt: { $gte: startOfDay } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.aggregate([
          { $match: { paymentStatus: 'PAID' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        CreditWallet.aggregate([{ $group: { _id: null, total: { $sum: '$lifetimePurchased' } } }]),
        CreditWallet.aggregate([{ $group: { _id: null, total: { $sum: '$lifetimeUsed' } } }]),
        Job.countDocuments({ jobStatus: { $in: ['QUEUED', 'SENT_TO_APP', 'ACKNOWLEDGED', 'DOWNLOADING', 'PROCESSING', 'PRINTING'] } }),
        Job.countDocuments({ jobStatus: 'FAILED' }),
        Job.countDocuments({ jobStatus: 'COMPLETED' }),
        Job.find().sort({ createdAt: -1 }).limit(10).populate('centerId', 'centerName centerCode').lean(),
        AuditLog.find().sort({ createdAt: -1 }).limit(10).lean()
      ]);

      const storageStats = await storageService.getStorageStats();

      return ApiResponse.success(res, {
        totalCenters,
        activeCenters,
        suspendedCenters,
        totalDevices,
        activeDevices,
        onlineDevices: activeDevices,
        todayOrders,
        todayRevenue: todayRevenueAgg[0]?.total || 0,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        totalCreditsPurchased: totalCreditsPurchasedAgg[0]?.total || 0,
        totalCreditsUsed: totalCreditsUsedAgg[0]?.total || 0,
        pendingJobs,
        failedJobs,
        completedJobs,
        storageStats,
        recentJobs,
        recentAuditLogs
      }, 'Admin dashboard metrics retrieved');
    } catch (err) {
      logger.error(`[AdminController] Analytics error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * List Centers
   * GET /api/v1/admin/centers
   */
  async listCenters(req, res) {
    try {
      const { search, status, page = 1, limit = 50 } = req.query;
      const query = {};
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { centerName: new RegExp(search, 'i') },
          { centerCode: new RegExp(search, 'i') },
          { city: new RegExp(search, 'i') }
        ];
      }

      const total = await Center.countDocuments(query);
      const centers = await Center.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('ownerId', 'name email mobile')
        .lean();

      return ApiResponse.paginate(res, centers, total, page, limit, 'Centers list');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Update Center Status or Adjust Credits
   * PATCH /api/v1/admin/centers/:id
   */
  async updateCenter(req, res) {
    try {
      const { id } = req.params;
      const { status, isActive, isVerified, walletAdjustment, adjustmentReason } = req.body;

      const center = await Center.findById(id);
      if (!center) return ApiResponse.error(res, 'Center not found', 404);

      if (status) center.status = status;
      if (isActive !== undefined) center.isActive = isActive;
      if (isVerified !== undefined) center.isVerified = isVerified;

      // Handle manual credit adjustment with audit record
      if (walletAdjustment && Number(walletAdjustment) !== 0) {
        await creditLedgerService.adminAdjustment({
          centerId: center._id,
          credits: Number(walletAdjustment),
          reason: adjustmentReason || 'Admin manual credit adjustment',
          adminUserId: req.user?.id
        });
      }

      await center.save();

      // Audit Log
      await AuditLog.create({
        action: 'CENTER_UPDATED',
        performedBy: req.user?.id,
        performedByRole: 'ADMIN',
        targetType: 'CENTER',
        targetId: center._id,
        details: { status, walletAdjustment, adjustmentReason },
        ipAddress: req.ip
      });

      return ApiResponse.success(res, center, 'Center updated successfully');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * List All Orders
   * GET /api/v1/admin/orders
   */
  async listOrders(req, res) {
    try {
      const { search, status, paymentStatus, page = 1, limit = 50 } = req.query;
      const query = {};
      if (status) query.orderStatus = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (search) {
        query.$or = [{ orderId: new RegExp(search, 'i') }, { customerName: new RegExp(search, 'i') }];
      }

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('centerId', 'centerName centerCode city')
        .populate('jobId')
        .lean();

      return ApiResponse.paginate(res, orders, total, page, limit, 'Orders list');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * List Global Credit Ledger
   * GET /api/v1/admin/credits
   */
  async listCredits(req, res) {
    try {
      const { page = 1, limit = 50, type } = req.query;
      const query = {};
      if (type) query.transactionType = type;

      const total = await CreditTransaction.countDocuments(query);
      const items = await CreditTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('centerId', 'centerName centerCode')
        .lean();

      return ApiResponse.paginate(res, items, total, page, limit, 'Credit ledger');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * List All Registered Devices
   * GET /api/v1/admin/devices
   */
  async listDevices(req, res) {
    try {
      const { search, status } = req.query;
      const query = {};
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { deviceId: new RegExp(search, 'i') },
          { installationId: new RegExp(search, 'i') },
          { deviceName: new RegExp(search, 'i') }
        ];
      }

      const devices = await Device.find(query)
        .sort({ lastSeenAt: -1 })
        .populate('centerId', 'centerName centerCode city state')
        .lean();

      const enriched = devices.map((d) => ({
        ...d,
        isOnline: d.status === 'ACTIVE' && d.lastSeenAt && Date.now() - new Date(d.lastSeenAt).getTime() < 180000
      }));

      return ApiResponse.success(res, enriched, 'Devices list');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Update Device Status (Activate / Revoke / Block)
   * PATCH /api/v1/admin/devices/:id
   */
  async updateDevice(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const device = await Device.findById(id);
      if (!device) return ApiResponse.error(res, 'Device not found', 404);

      device.status = status;
      if (status === 'REVOKED' || status === 'BLOCKED') {
        device.revokedAt = new Date();
      }
      await device.save();

      await AuditLog.create({
        action: `DEVICE_STATUS_${status}`,
        performedBy: req.user?.id,
        performedByRole: 'ADMIN',
        targetType: 'DEVICE',
        targetId: device._id,
        details: { deviceId: device.deviceId, status },
        ipAddress: req.ip
      });

      return ApiResponse.success(res, device, `Device status updated to ${status}`);
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Credit Packages Management
   * GET /api/v1/admin/packages
   */
  async listPackages(req, res) {
    try {
      const packages = await CreditPackage.find().sort({ displayOrder: 1, price: 1 }).lean();
      return ApiResponse.success(res, packages, 'Credit packages');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  async createPackage(req, res) {
    try {
      const { name, price, credits, displayOrder, active } = req.body;
      const pkg = await CreditPackage.create({ name, price, credits, displayOrder, active });
      return ApiResponse.created(res, pkg, 'Package created');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  async updatePackage(req, res) {
    try {
      const { id } = req.params;
      const pkg = await CreditPackage.findByIdAndUpdate(id, req.body, { new: true });
      return ApiResponse.success(res, pkg, 'Package updated');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Job Types & Pricing Matrix Management
   * GET /api/v1/admin/job-types
   */
  async listJobTypes(req, res) {
    try {
      const rules = await PricingRule.find().lean();
      return ApiResponse.success(res, rules, 'Job rates matrix');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  async updateJobType(req, res) {
    try {
      const { id } = req.params;
      const rule = await PricingRule.findByIdAndUpdate(id, req.body, { new: true });
      return ApiResponse.success(res, rule, 'Job rate updated');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Auto-updater Release Management
   * GET /api/v1/admin/releases
   */
  async listReleases(req, res) {
    try {
      const releases = await UpdateRelease.find().sort({ publishedAt: -1 }).lean();
      return ApiResponse.success(res, releases, 'Desktop app releases');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  async createRelease(req, res) {
    try {
      const { version, channel, platform = 'win32', downloadUrl, releaseNotes, sha512, minimumSupportedVersion, isMandatory } = req.body;
      const release = await UpdateRelease.create({
        version,
        channel,
        platform,
        downloadUrl,
        releaseNotes,
        sha512,
        minimumSupportedVersion: minimumSupportedVersion || '1.0.0',
        isMandatory: Boolean(isMandatory)
      });
      return ApiResponse.created(res, release, 'Release manifest published');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Audit Logs
   * GET /api/v1/admin/audit-logs
   */
  async listAuditLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const total = await AuditLog.countDocuments();
      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('performedBy', 'name email role')
        .lean();

      return ApiResponse.paginate(res, logs, total, page, limit, 'Audit logs');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }
}

module.exports = new AdminController();
