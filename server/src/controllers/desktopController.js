const { v4: uuidv4 } = require('uuid');
const StudioCenter = require('../models/StudioCenter');
const Device = require('../models/Device');
const Job = require('../models/Job');
const UpdateRelease = require('../models/UpdateRelease');
const jobEngineService = require('../services/jobEngineService');
const { generateDeviceToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');
const { DEVICE_STATUS, JOB_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Registers or pairs an Electron desktop application with a CSC Studio Center
 */
const registerOrPairDevice = async (req, res, next) => {
  try {
    const { installationId, pairingCode, centerCode, deviceName, hardwareFingerprint, appVersion, osPlatform } = req.body;

    if (!installationId) {
      return ApiResponse.error(res, 'installationId is required', 400);
    }

    let center = null;

    // 1. Try pairing via 6-digit one-time pairing code
    if (pairingCode) {
      center = await StudioCenter.findOne({
        'pairingCode.code': pairingCode.trim(),
        'pairingCode.expiresAt': { $gt: new Date() },
        isActive: true
      });
    }

    // 2. Fallback to centerCode if authorized
    if (!center && centerCode) {
      center = await StudioCenter.findOne({
        centerCode: centerCode.trim().toUpperCase(),
        isActive: true
      });
    }

    if (!center) {
      return ApiResponse.error(
        res,
        'Invalid or expired pairing code. Please generate a fresh pairing code from the Studio Portal.',
        400
      );
    }

    // 3. Find or create device record
    let device = await Device.findOne({
      centerId: center._id,
      installationId
    });

    const generatedDeviceId = device ? device.deviceId : `PIP-DEV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    if (!device) {
      device = new Device({
        centerId: center._id,
        installationId,
        deviceId: generatedDeviceId,
        deviceName: deviceName || 'Prime ID Pro Desktop Client',
        hardwareFingerprint: hardwareFingerprint || '',
        appVersion: appVersion || '1.0.0',
        status: DEVICE_STATUS.ACTIVE,
        metrics: {
          osPlatform: osPlatform || 'win32'
        }
      });
    } else {
      device.deviceName = deviceName || device.deviceName;
      device.hardwareFingerprint = hardwareFingerprint || device.hardwareFingerprint;
      device.appVersion = appVersion || device.appVersion;
      device.status = DEVICE_STATUS.ACTIVE;
    }

    // Generate permanent device JWT token
    const token = generateDeviceToken({
      id: device._id,
      centerId: center._id,
      installationId,
      deviceId: generatedDeviceId
    });

    device.authToken = token;
    device.lastSeenAt = new Date();
    await device.save();

    // Clear pairing code once paired
    if (pairingCode) {
      center.pairingCode = { code: null, expiresAt: null };
      await center.save();
    }

    logger.info(`[DesktopController] Desktop paired successfully: ${generatedDeviceId} to Center ${center.centerCode}`);

    return ApiResponse.success(
      res,
      {
        deviceId: generatedDeviceId,
        deviceToken: token,
        center: {
          id: center._id,
          centerName: center.centerName,
          centerCode: center.centerCode,
          walletBalance: center.walletBalance
        }
      },
      'Desktop paired successfully with Studio Center'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Desktop client heartbeat
 */
const heartbeat = async (req, res, next) => {
  try {
    const { printerStatus, diskSpaceMb, pendingJobsInQueue } = req.body;
    const device = req.device;

    if (printerStatus) {
      device.metrics.printerName = printerStatus.name || device.metrics.printerName;
    }
    await device.save();

    const pendingCount = await Job.countDocuments({
      centerId: req.centerId,
      jobStatus: { $in: [JOB_STATUS.DISPATCHED, JOB_STATUS.DOWNLOADING, JOB_STATUS.PROCESSING, JOB_STATUS.READY, JOB_STATUS.PRINTING] }
    });

    const center = await StudioCenter.findById(req.centerId).select('walletBalance centerName centerCode');

    return ApiResponse.success(res, {
      status: 'OK',
      serverTime: new Date().toISOString(),
      pendingJobsCount: pendingCount,
      walletBalance: center ? center.walletBalance : 0
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Returns pending jobs to be processed and printed by the desktop client
 */
const getPendingJobs = async (req, res, next) => {
  try {
    const jobs = await jobEngineService.getPendingJobsForCenter(req.centerId);

    const formattedJobs = jobs.map((job) => ({
      id: job._id,
      jobCode: job.jobCode,
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      serviceType: job.serviceType,
      serviceName: job.serviceName,
      paperSize: job.paperSize,
      copies: job.copies,
      priceInr: job.priceInr,
      creditCost: job.creditCost,
      jobStatus: job.jobStatus,
      temporaryPhotoUrl: job.temporaryPhotoUrl,
      cropSettings: job.cropSettings,
      backgroundColor: job.backgroundColor,
      createdAt: job.createdAt
    }));

    return ApiResponse.success(res, formattedJobs, 'Pending print jobs');
  } catch (err) {
    next(err);
  }
};

/**
 * Desktop claims a job for downloading and local processing
 */
const claimJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobEngineService.claimJob(id, req.device._id);

    return ApiResponse.success(res, job, 'Job claimed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Desktop updates job state (e.g. PROCESSING, READY, PRINTING)
 */
const updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const job = await jobEngineService.updateJobStatus(id, status, message, 'DESKTOP_CLIENT');

    return ApiResponse.success(res, job, `Job status transitioned to ${status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Desktop posts print completion callback
 * Triggers credit ledger deduction and 10-min privacy auto-purge
 */
const completeJobCallback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { idempotencyKey, printMetrics } = req.body;

    const job = await jobEngineService.completeJob(id, req.device._id, idempotencyKey, printMetrics);
    const center = await StudioCenter.findById(req.centerId).select('walletBalance');

    return ApiResponse.success(
      res,
      {
        job: {
          id: job._id,
          jobCode: job.jobCode,
          jobStatus: job.jobStatus,
          completedAt: job.completedAt,
          photoExpiresAt: job.photoExpiresAt
        },
        walletBalance: center ? center.walletBalance : 0
      },
      'Job print completed and credit ledger updated'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Auto-update manifest checker for Prime ID Pro desktop client
 */
const checkUpdates = async (req, res, next) => {
  try {
    const { version = '1.0.0', channel = 'stable' } = req.query;

    const latestRelease = await UpdateRelease.findOne({
      channel,
      isActive: true
    }).sort({ publishedAt: -1 });

    if (!latestRelease) {
      return ApiResponse.success(res, { updateAvailable: false }, 'No updates available');
    }

    const isNewer = latestRelease.version !== version;
    const isMandatory = latestRelease.isMandatory || (latestRelease.minimumSupportedVersion && version < latestRelease.minimumSupportedVersion);

    return ApiResponse.success(res, {
      updateAvailable: isNewer,
      version: latestRelease.version,
      releaseDate: latestRelease.publishedAt,
      downloadUrl: latestRelease.downloadUrl,
      releaseNotes: latestRelease.releaseNotes,
      sha512: latestRelease.sha512,
      isMandatory: Boolean(isMandatory),
      minimumSupportedVersion: latestRelease.minimumSupportedVersion
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerOrPairDevice,
  heartbeat,
  getPendingJobs,
  claimJob,
  updateJobStatus,
  completeJobCallback,
  checkUpdates
};
