const Center = require('../models/Center');
const CreditWallet = require('../models/CreditWallet');
const CreditTransaction = require('../models/CreditTransaction');
const CreditPackage = require('../models/CreditPackage');
const Order = require('../models/Order');
const Job = require('../models/Job');
const Device = require('../models/Device');
const AuditLog = require('../models/AuditLog');
const creditLedgerService = require('../services/creditLedgerService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const QRCode = require('qrcode');
const env = require('../config/env');
const crypto = require('crypto');

class CenterController {
  /**
   * CSC Studio Dashboard Metrics
   * GET /api/v1/centers/dashboard
   */
  async getDashboard(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      if (!centerId) {
        return ApiResponse.error(res, 'No studio center associated with this user', 403);
      }

      const center = await Center.findById(centerId);
      if (!center) {
        return ApiResponse.error(res, 'Center not found', 404);
      }

      const wallet = await creditLedgerService.getOrCreateWallet(centerId);

      // Date ranges for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Metrics in parallel
      const [todayOrders, todayRevenueAgg, pendingJobs, completedJobs, devices, recentOrders] = await Promise.all([
        Order.countDocuments({ centerId, createdAt: { $gte: startOfDay } }),
        Order.aggregate([
          { $match: { centerId, paymentStatus: 'PAID', createdAt: { $gte: startOfDay } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Job.countDocuments({
          centerId,
          jobStatus: { $in: ['QUEUED', 'SENT_TO_APP', 'ACKNOWLEDGED', 'DOWNLOADING', 'PROCESSING', 'PRINTING'] }
        }),
        Job.countDocuments({ centerId, jobStatus: 'COMPLETED' }),
        Device.find({ centerId }).lean(),
        Order.find({ centerId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      ]);

      const todayRevenue = todayRevenueAgg[0]?.total || 0;
      const onlineDevices = devices.filter(
        (d) => d.status === 'ACTIVE' && d.lastSeenAt && Date.now() - new Date(d.lastSeenAt).getTime() < 180000
      ).length;

      return ApiResponse.success(res, {
        center: {
          id: center._id,
          centerName: center.centerName,
          centerCode: center.centerCode,
          slug: center.slug,
          qrToken: center.qrToken,
          status: center.status,
          serviceSettings: center.serviceSettings
        },
        wallet: {
          currentBalance: wallet.currentBalance,
          lifetimePurchased: wallet.lifetimePurchased,
          lifetimeUsed: wallet.lifetimeUsed
        },
        metrics: {
          todayOrders,
          todayRevenue,
          pendingJobs,
          completedJobs,
          totalDevices: devices.length,
          onlineDevices,
          hasOnlineDevice: onlineDevices > 0
        },
        recentOrders
      }, 'Dashboard metrics retrieved');
    } catch (err) {
      logger.error(`[CenterController] Dashboard error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * CSC Orders List with Filters
   * GET /api/v1/centers/orders
   */
  async getOrders(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;

      const query = { centerId };
      if (status && status !== 'ALL') query.orderStatus = status;
      if (paymentStatus && paymentStatus !== 'ALL') query.paymentStatus = paymentStatus;

      if (search) {
        query.$or = [
          { orderId: new RegExp(search, 'i') },
          { customerName: new RegExp(search, 'i') },
          { customerPhone: new RegExp(search, 'i') }
        ];
      }

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('jobId', 'jobCode jobStatus copies creditCost temporaryPhotoUrl photoExpiresAt isPhotoPurged')
        .lean();

      return ApiResponse.success(res, {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit)
        }
      }, 'Orders retrieved');
    } catch (err) {
      logger.error(`[CenterController] Get orders error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Marks a Cash Order as Received and queues job for desktop
   * POST /api/v1/centers/orders/:orderId/cash-received
   */
  async markCashReceived(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const { orderId } = req.params;

      const order = await Order.findOne({
        centerId,
        $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }]
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found or not owned by this center', 404);
      }

      if (order.paymentStatus === 'PAID') {
        return ApiResponse.error(res, 'Payment for this order is already confirmed', 400);
      }

      // Mark Payment Received
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.cashReceivedAt = new Date();
      order.cashReceivedBy = req.user?._id;
      await order.save();

      // Transition Job to QUEUED so desktop client receives it
      if (order.jobId) {
        const job = await Job.findById(order.jobId);
        if (job) {
          job.jobStatus = 'QUEUED';
          job.addStatusHistory('QUEUED', 'Cash payment confirmed by operator at center counter', 'CSC_PORTAL');
          await job.save();
        }
      }

      // Record Audit Log
      await AuditLog.create({
        action: 'CASH_PAYMENT_CONFIRMED',
        performedBy: req.user?._id,
        performedByRole: req.user?.role || 'CSC',
        targetType: 'ORDER',
        targetId: order._id,
        details: { orderId: order.orderId, amount: order.totalAmount, centerId },
        ipAddress: req.ip
      });

      logger.info(`[CenterController] Cash payment confirmed for Order #${order.orderId} by Operator ${req.user?.name}`);

      return ApiResponse.success(res, {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        cashReceivedAt: order.cashReceivedAt
      }, 'Cash payment marked as received. Order dispatched to desktop print queue.');
    } catch (err) {
      logger.error(`[CenterController] Cash received confirmation error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * CSC Credit Balance and Transaction History
   * GET /api/v1/centers/credits
   */
  async getCredits(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const wallet = await creditLedgerService.getOrCreateWallet(centerId);
      const history = await creditLedgerService.getCenterHistory(centerId, req.query);

      return ApiResponse.success(res, {
        wallet: {
          currentBalance: wallet.currentBalance,
          lifetimePurchased: wallet.lifetimePurchased,
          lifetimeUsed: wallet.lifetimeUsed
        },
        transactions: history.items,
        total: history.total,
        page: history.page,
        limit: history.limit
      }, 'Credit details retrieved');
    } catch (err) {
      logger.error(`[CenterController] Get credits error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Available Credit Packages
   * GET /api/v1/centers/packages
   */
  async getPackages(req, res) {
    try {
      let packages = await CreditPackage.find({ active: true }).sort({ displayOrder: 1, price: 1 }).lean();

      // If empty, return default dynamic packages
      if (packages.length === 0) {
        packages = [
          { _id: 'pkg_100', name: 'Starter Pack', price: 100, credits: 100, active: true },
          { _id: 'pkg_500', name: 'Growth Pack', price: 500, credits: 550, active: true },
          { _id: 'pkg_1000', name: 'Studio Pro', price: 1000, credits: 1150, active: true },
          { _id: 'pkg_2000', name: 'Enterprise Hub', price: 2000, credits: 2400, active: true }
        ];
      }

      return ApiResponse.success(res, packages, 'Credit packages retrieved');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * CSC Studio Profile
   * GET /api/v1/centers/me
   */
  async getCenterProfile(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      if (!centerId) {
        return ApiResponse.error(res, 'No studio center associated with this user', 403);
      }

      const center = await Center.findById(centerId);
      if (!center) {
        return ApiResponse.error(res, 'Center not found', 404);
      }

      if (!center.qrToken) {
        center.qrToken = crypto.randomBytes(16).toString('hex');
        await center.save();
      }

      const wallet = await creditLedgerService.getOrCreateWallet(centerId);

      return ApiResponse.success(res, {
        ...center.toObject(),
        walletBalance: wallet ? wallet.currentBalance : center.walletBalance
      }, 'Center profile retrieved');
    } catch (err) {
      logger.error(`[CenterController] Profile error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Photo Service Configuration
   * GET /api/v1/centers/service-settings
   */
  async getServiceSettings(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const center = await Center.findById(centerId);
      if (!center) return ApiResponse.error(res, 'Center not found', 404);

      if (!center.qrToken) {
        center.qrToken = crypto.randomBytes(16).toString('hex');
        await center.save();
      }

      return ApiResponse.success(res, {
        serviceSettings: center.serviceSettings,
        settings: center.serviceSettings,
        pricePerPhoto: center.serviceSettings?.pricePerPhoto ?? 7,
        minimumQuantity: center.serviceSettings?.minimumQuantity ?? 3,
        maximumQuantity: center.serviceSettings?.maximumQuantity ?? 20,
        quantityStep: center.serviceSettings?.quantityStep ?? 1,
        onlinePaymentEnabled: center.serviceSettings?.onlinePaymentEnabled ?? true,
        cashPaymentEnabled: center.serviceSettings?.cashPaymentEnabled ?? true,
        serviceEnabled: center.serviceSettings?.serviceEnabled ?? true,
        center: {
          _id: center._id,
          id: center._id,
          centerName: center.centerName,
          centerCode: center.centerCode,
          slug: center.slug,
          qrToken: center.qrToken
        },
        _id: center._id,
        qrToken: center.qrToken,
        slug: center.slug,
        centerName: center.centerName,
        centerCode: center.centerCode
      }, 'Service settings retrieved');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Updates Photo Service Configuration
   * PUT /api/v1/centers/service-settings
   */
  async updateServiceSettings(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const {
        serviceEnabled,
        pricePerPhoto,
        minimumQuantity,
        maximumQuantity,
        quantityStep,
        onlinePaymentEnabled,
        cashPaymentEnabled
      } = req.body;

      const center = await Center.findById(centerId);
      if (!center) return ApiResponse.error(res, 'Center not found', 404);

      if (pricePerPhoto !== undefined && pricePerPhoto < 1) {
        return ApiResponse.error(res, 'Price per photo must be at least ₹1', 400);
      }

      if (minimumQuantity !== undefined && maximumQuantity !== undefined && minimumQuantity > maximumQuantity) {
        return ApiResponse.error(res, 'Minimum quantity cannot exceed maximum quantity', 400);
      }

      center.serviceSettings = {
        ...center.serviceSettings,
        ...(serviceEnabled !== undefined && { serviceEnabled: Boolean(serviceEnabled) }),
        ...(pricePerPhoto !== undefined && { pricePerPhoto: Number(pricePerPhoto) }),
        ...(minimumQuantity !== undefined && { minimumQuantity: Number(minimumQuantity) }),
        ...(maximumQuantity !== undefined && { maximumQuantity: Number(maximumQuantity) }),
        ...(quantityStep !== undefined && { quantityStep: Number(quantityStep) }),
        ...(onlinePaymentEnabled !== undefined && { onlinePaymentEnabled: Boolean(onlinePaymentEnabled) }),
        ...(cashPaymentEnabled !== undefined && { cashPaymentEnabled: Boolean(cashPaymentEnabled) })
      };

      await center.save();
      logger.info(`[CenterController] Service settings updated for Center ${center.centerCode}`);

      return ApiResponse.success(res, center.serviceSettings, 'Photo service settings updated successfully');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * QR Code and Poster Data
   * GET /api/v1/centers/qr
   */
  async getQr(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const center = await Center.findById(centerId);
      if (!center) return ApiResponse.error(res, 'Center not found', 404);

      if (!center.qrToken) {
        center.qrToken = crypto.randomBytes(16).toString('hex');
        await center.save();
      }

      let publicDomain = 'https://www.primeidpro.online';
      if (env.CLIENT_URL && !env.CLIENT_URL.includes('api.')) {
        publicDomain = env.CLIENT_URL.replace(/\/api(\/v\d+)?\/?$/, '').replace(/\/$/, '');
      }
      const kioskUrl = `${publicDomain}/order/${center.qrToken}`;
      const qrDataUrl = await QRCode.toDataURL(kioskUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: { dark: '#1E1B4B', light: '#FFFFFF' }
      });

      return ApiResponse.success(res, {
        centerName: center.centerName,
        centerCode: center.centerCode,
        qrToken: center.qrToken,
        slug: center.slug,
        kioskUrl,
        qrDataUrl
      }, 'QR poster data generated');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Regenerates QR Token (Revoking old token)
   * POST /api/v1/centers/qr/regenerate
   */
  async regenerateQr(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const center = await Center.findById(centerId);
      if (!center) return ApiResponse.error(res, 'Center not found', 404);

      const oldToken = center.qrToken;
      const newToken = center.regenerateQrToken();
      await center.save();

      // Audit Log
      await AuditLog.create({
        action: 'QR_TOKEN_REGENERATED',
        performedBy: req.user?._id,
        performedByRole: req.user?.role || 'CSC',
        targetType: 'CENTER',
        targetId: center._id,
        details: { oldToken, newToken },
        ipAddress: req.ip
      });

      logger.info(`[CenterController] QR token regenerated for Center ${center.centerCode}`);

      return this.getQr(req, res);
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Connected Desktop Devices
   * GET /api/v1/centers/devices
   */
  async getDevices(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const devices = await Device.find({ centerId }).sort({ lastSeenAt: -1 }).lean();

      const enriched = devices.map((d) => ({
        ...d,
        isOnline: d.status === 'ACTIVE' && d.lastSeenAt && Date.now() - new Date(d.lastSeenAt).getTime() < 180000
      }));

      return ApiResponse.success(res, enriched, 'Devices retrieved');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Revoke a Desktop Device Authorization
   * DELETE /api/v1/centers/devices/:deviceId
   */
  async revokeDevice(req, res) {
    try {
      const centerId = req.centerId || req.user?.centerId;
      const { deviceId } = req.params;

      const device = await Device.findOne({
        centerId,
        $or: [{ deviceId }, { _id: deviceId.match(/^[0-9a-fA-F]{24}$/) ? deviceId : null }]
      });

      if (!device) {
        return ApiResponse.error(res, 'Device not found or not owned by this center', 404);
      }

      device.status = 'REVOKED';
      device.revokedAt = new Date();
      await device.save();

      await AuditLog.create({
        action: 'DEVICE_REVOKED',
        performedBy: req.user?._id,
        performedByRole: req.user?.role || 'CSC',
        targetType: 'DEVICE',
        targetId: device._id,
        details: { deviceId: device.deviceId, centerId },
        ipAddress: req.ip
      });

      return ApiResponse.success(res, { deviceId: device.deviceId, status: device.status }, 'Device authorization revoked');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }
}

module.exports = new CenterController();
