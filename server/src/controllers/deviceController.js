const Device = require('../models/Device');
const Center = require('../models/Center');
const Job = require('../models/Job');
const JobItem = require('../models/JobItem');
const UpdateRelease = require('../models/UpdateRelease');
const AuditLog = require('../models/AuditLog');
const UploadSession = require('../models/UploadSession');
const creditLedgerService = require('../services/creditLedgerService');
const storageService = require('../services/storageService');
const { signDeviceToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const crypto = require('crypto');

class DeviceController {
  /**
   * Register/Pair a new Electron desktop client
   * POST /api/v1/devices/register
   */
  async registerDevice(req, res) {
    try {
      const rawCode = req.body.pairingCode || req.body.pairingPin || req.body.pin || req.body.code;
      const pairingCode = typeof rawCode === 'string' ? rawCode.trim() : (rawCode ? String(rawCode).trim() : '');
      const installationId = req.body.installationId || req.body.machineId || req.body.hardwareFingerprint || req.body.deviceId || `inst_${crypto.randomUUID()}`;
      const deviceName = req.body.deviceName || req.body.terminalLabel || req.body.label || req.body.pcLabel || 'Front Counter PC';
      const hardwareFingerprint = req.body.hardwareFingerprint || req.body.fingerprint || '';
      const appVersion = req.body.appVersion || '1.0.0';
      const osPlatform = req.body.osPlatform || req.body.platform || 'win32';

      if (!pairingCode) {
        return ApiResponse.error(res, '6-digit Pairing Code is required', 400);
      }

      // 1. Verify Pairing Code
      const center = await Center.findOne({
        pairingCode,
        pairingCodeExpiresAt: { $gt: new Date() }
      });

      if (!center) {
        return ApiResponse.error(res, 'Invalid or expired 6-digit pairing code. Please generate a fresh code from your CSC Operator Portal.', 400);
      }

      if (center.status === 'SUSPENDED' || center.status === 'BLOCKED') {
        return ApiResponse.error(res, 'Studio Center account is suspended or blocked', 403);
      }

      // If this installation was previously bound to another center, revoke the old binding
      const boundToOtherCenter = await Device.findOne({
        installationId,
        centerId: { $ne: center._id },
        status: { $in: ['ACTIVE', 'PENDING'] }
      });
      if (boundToOtherCenter) {
        boundToOtherCenter.status = 'REVOKED';
        await boundToOtherCenter.save();
        logger.info(`[DeviceController] Revoked previous center binding for installation ${installationId}`);
      }

      // 2. Generate unique Device ID
      const deviceId = `PIP-DEV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const tokenPayload = {
        deviceId,
        installationId,
        centerId: center._id.toString()
      };
      const deviceToken = signDeviceToken(tokenPayload);
      const authTokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');

      // 3. Upsert Device Record
      let device = await Device.findOne({ installationId, centerId: center._id });
      if (device) {
        device.deviceId = deviceId;
        device.deviceName = deviceName || device.deviceName;
        device.hardwareFingerprint = hardwareFingerprint || device.hardwareFingerprint;
        device.authToken = deviceToken;
        device.authTokenHash = authTokenHash;
        device.appVersion = appVersion;
        device.status = 'ACTIVE';
        device.lastSeenAt = new Date();
        device.metrics.osPlatform = osPlatform;
        await device.save();
      } else {
        device = await Device.create({
          centerId: center._id,
          installationId,
          deviceId,
          deviceName: deviceName || 'Front Counter PC',
          hardwareFingerprint: hardwareFingerprint || '',
          authToken: deviceToken,
          authTokenHash,
          appVersion,
          status: 'ACTIVE',
          lastSeenAt: new Date(),
          metrics: { osPlatform }
        });
      }

      // Clear used pairing code
      center.pairingCode = null;
      center.pairingCodeExpiresAt = null;
      await center.save();

      // Audit Log
      await AuditLog.create({
        action: 'DEVICE_REGISTERED',
        performedBy: center.ownerId,
        performedByRole: 'CSC',
        targetType: 'DEVICE',
        targetId: device._id,
        details: { deviceId, installationId, centerCode: center.centerCode },
        ipAddress: req.ip
      });

      logger.info(`[DeviceController] Desktop device ${deviceId} paired successfully with Center ${center.centerCode}`);

      return ApiResponse.success(res, {
        deviceId: device.deviceId,
        deviceToken,
        token: deviceToken,
        center: {
          id: center._id,
          _id: center._id,
          centerName: center.centerName,
          centerCode: center.centerCode,
          walletBalance: center.walletBalance
        }
      }, 'Device paired successfully');
    } catch (err) {
      logger.error(`[DeviceController] Register device error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Activate device
   * POST /api/v1/devices/activate
   */
  async activateDevice(req, res) {
    try {
      const { deviceId, installationId } = req.body;
      if (!deviceId && !installationId) {
        return ApiResponse.error(res, 'Device identifier required for activation', 400);
      }

      const query = {};
      if (deviceId) query.deviceId = deviceId;
      if (installationId) query.installationId = installationId;

      const device = await Device.findOne(query);
      if (!device) {
        return ApiResponse.error(res, 'Device not found', 404);
      }

      if (device.status === 'REVOKED' || device.status === 'BLOCKED') {
        return ApiResponse.error(res, 'Revoked or blocked devices cannot be activated without re-pairing', 403);
      }

      if (device.status === 'ACTIVE') {
        return ApiResponse.success(res, { deviceId: device.deviceId, status: device.status }, 'Device is already active');
      }

      device.status = 'ACTIVE';
      device.lastSeenAt = new Date();
      await device.save();

      await AuditLog.create({
        action: 'DEVICE_ACTIVATED',
        performedBy: device.centerId,
        performedByRole: 'SYSTEM',
        targetType: 'DEVICE',
        targetId: device._id,
        details: { deviceId: device.deviceId, installationId: device.installationId },
        ipAddress: req.ip
      });

      return ApiResponse.success(res, { deviceId: device.deviceId, status: device.status }, 'Device activated successfully');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Desktop Heartbeat
   * POST /api/v1/devices/heartbeat
   */
  async heartbeat(req, res) {
    try {
      const device = req.device;
      const { printerStatus, diskSpaceMb, pendingJobsInQueue } = req.body;

      device.lastSeenAt = new Date();
      device.ipAddress = req.ip;
      if (printerStatus?.name) {
        device.metrics.printerName = printerStatus.name;
      }
      await device.save();

      // Check pending jobs count for bound center
      const pendingJobsCount = await Job.countDocuments({
        centerId: device.centerId,
        jobStatus: { $in: ['QUEUED', 'SENT_TO_APP'] }
      });

      return ApiResponse.success(res, {
        deviceId: device.deviceId,
        status: device.status,
        pendingJobsCount,
        serverTime: new Date()
      }, 'Heartbeat acknowledged');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Polls pending jobs for the bound center (Strict Tenant Isolation, Unpaid excluded)
   * GET /api/v1/app/pending-jobs
   */
  async getPendingJobs(req, res) {
    try {
      const device = req.device;

      if (device.status !== 'ACTIVE') {
        return ApiResponse.error(res, 'This device authorization is revoked or suspended', 403);
      }

      // Fetch QUEUED, SENT_TO_APP, DISPATCHED, or CONFIRMED jobs for this center
      const jobs = await Job.find({
        centerId: device.centerId,
        $or: [
          { jobStatus: { $in: ['QUEUED', 'SENT_TO_APP', 'DISPATCHED'] } },
          { jobStatus: 'CONFIRMED', paymentStatus: 'PAID' }
        ]
      })
        .sort({ createdAt: 1 })
        .limit(10)
        .lean();

      // Populate multi-photo JobItems for each job with signed download URLs
      const enrichedJobs = await Promise.all(
        jobs.map(async (job) => {
          const rawItems = await JobItem.find({ jobId: job._id }).sort({ photoIndex: 1 }).lean();
          const itemsList = rawItems.length > 0 ? rawItems : (job.itemsData || []);

          // Generate short-lived signed download URLs for each item
          const itemsWithSignedUrls = await Promise.all(
            itemsList.map(async (item) => {
              let signedUrl = item.photoUrl;
              if (item.storageKey && !job.isPhotoPurged) {
                try {
                  signedUrl = await storageService.getSignedDownloadUrl({
                    storageKey: item.storageKey,
                    expiresInSeconds: 1800, // 30 mins
                    originalFileName: item.originalFileName
                  });
                } catch (urlErr) {
                  logger.warn(`[DeviceController] Could not sign download URL for item: ${urlErr.message}`);
                }
              }
              return {
                ...item,
                photoUrl: signedUrl || item.photoUrl,
                downloadUrl: signedUrl || item.photoUrl
              };
            })
          );

          // Generate signed URL for primary photo
          let primaryPhotoUrl = job.temporaryPhotoUrl;
          const primaryKey = job.temporaryStorageKey || job.storageKey || itemsWithSignedUrls[0]?.storageKey;
          if (primaryKey && !job.isPhotoPurged) {
            try {
              primaryPhotoUrl = await storageService.getSignedDownloadUrl({
                storageKey: primaryKey,
                expiresInSeconds: 1800
              });
            } catch (urlErr) {
              logger.warn(`[DeviceController] Could not sign primary photo URL: ${urlErr.message}`);
            }
          }

          return {
            ...job,
            temporaryPhotoUrl: primaryPhotoUrl || job.temporaryPhotoUrl,
            items: itemsWithSignedUrls
          };
        })
      );

      return ApiResponse.success(res, enrichedJobs, 'Pending jobs retrieved');
    } catch (err) {
      logger.error(`[DeviceController] Get pending jobs error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Securely streams or provides signed download URL for a specific job photo
   * GET /api/v1/app/jobs/:jobId/download-photo
   */
  async downloadJobPhoto(req, res) {
    try {
      const device = req.device;
      const { jobId, photoIndex = 1 } = req.params;

      const isObjectId = jobId && /^[0-9a-fA-F]{24}$/.test(jobId);
      const query = { centerId: device.centerId };
      if (isObjectId) query._id = jobId;
      else query.jobCode = jobId;

      const job = await Job.findOne(query);
      if (!job) {
        return ApiResponse.error(res, 'Job not found or not assigned to this center', 404);
      }

      if (job.isPhotoPurged) {
        return ApiResponse.error(res, 'Customer photo has expired and was permanently purged for privacy', 410);
      }

      // Find target storageKey
      let storageKey = job.temporaryStorageKey || job.storageKey;
      if (photoIndex > 1 || !storageKey) {
        const item = await JobItem.findOne({ jobId: job._id, photoIndex: Number(photoIndex) });
        if (item && item.storageKey) {
          storageKey = item.storageKey;
        }
      }

      if (!storageKey) {
        return ApiResponse.error(res, 'Photo reference not found for this job', 404);
      }

      // If redirect query requested or in cloud R2 mode, generate signed download URL
      const signedUrl = await storageService.getSignedDownloadUrl({
        storageKey,
        expiresInSeconds: 900
      });

      if (req.query.redirect === 'true' && signedUrl.startsWith('http')) {
        return res.redirect(signedUrl);
      }

      return ApiResponse.success(res, {
        jobId: job._id,
        jobCode: job.jobCode,
        photoIndex: Number(photoIndex),
        storageKey,
        downloadUrl: signedUrl,
        expiresInSeconds: 900
      }, 'Photo download URL generated');
    } catch (err) {
      logger.error(`[DeviceController] Download photo error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Desktop Claims / Acknowledges a job
   * POST /api/v1/app/jobs/:jobId/ack
   */
  async acknowledgeJob(req, res) {
    try {
      const device = req.device;
      const { jobId } = req.params;

      const isObjectId = jobId && /^[0-9a-fA-F]{24}$/.test(jobId);
      const query = {
        centerId: device.centerId,
        jobStatus: { $in: ['QUEUED', 'SENT_TO_APP'] }
      };

      if (isObjectId) {
        query._id = jobId;
      } else {
        query.jobCode = jobId;
      }

      // Atomic conditional claim
      const job = await Job.findOneAndUpdate(
        query,
        {
          jobStatus: 'ACKNOWLEDGED',
          claimedByDeviceId: device._id,
          claimedAt: new Date()
        },
        { new: true }
      );

      if (!job) {
        return ApiResponse.error(res, 'Job not found, already claimed by another machine, or not queued', 409);
      }

      job.addStatusHistory('ACKNOWLEDGED', `Claimed by Desktop Client ${device.deviceId}`, 'DESKTOP_CLIENT');
      await job.save();

      return ApiResponse.success(res, job, 'Job acknowledged and locked to device');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Updates Job State from Desktop (e.g. DOWNLOADING, PROCESSING, READY, PRINTING)
   * POST /api/v1/app/jobs/:jobId/status
   */
  async updateJobStatus(req, res) {
    try {
      const device = req.device;
      const { jobId } = req.params;
      const { status, message } = req.body;

      const allowed = ['DOWNLOADING', 'PROCESSING', 'READY', 'PRINTING', 'FAILED'];
      if (!allowed.includes(status)) {
        return ApiResponse.error(res, `Invalid status transition to ${status}`, 400);
      }

      const isObjectId = jobId && /^[0-9a-fA-F]{24}$/.test(jobId);
      const query = { centerId: device.centerId };
      if (isObjectId) query._id = jobId;
      else query.jobCode = jobId;

      const job = await Job.findOne(query);

      if (!job) {
        return ApiResponse.error(res, 'Job not found or not owned by this center', 404);
      }

      job.jobStatus = status;
      job.addStatusHistory(status, message || `State updated to ${status} by Desktop`, 'DESKTOP_CLIENT');
      await job.save();

      return ApiResponse.success(res, { jobId: job._id, jobStatus: job.jobStatus }, 'Status updated');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Desktop Completion Callback (Atomically finishes job, deducts credits, schedules 10m photo cleanup)
   * POST /api/v1/app/jobs/:jobId/complete
   */
  async completeJob(req, res) {
    try {
      const device = req.device;
      const { jobId } = req.params;
      const { idempotencyKey, printMetrics } = req.body;

      const isObjectId = jobId && /^[0-9a-fA-F]{24}$/.test(jobId);
      const query = { centerId: device.centerId };
      if (isObjectId) query._id = jobId;
      else query.jobCode = jobId;

      const job = await Job.findOne(query);

      if (!job) {
        return ApiResponse.error(res, 'Job not found or not owned by this center', 404);
      }

      const key = idempotencyKey || `complete_${job._id}_${job.jobCode}`;

      // If job already completed, return idempotent success
      if (job.jobStatus === 'COMPLETED') {
        const wallet = await creditLedgerService.getOrCreateWallet(device.centerId);
        logger.info(`[DeviceController] Idempotent completion callback for Job #${job.jobCode}`);
        return ApiResponse.success(res, {
          jobId: job._id,
          jobStatus: 'COMPLETED',
          creditsDeducted: job.creditCost,
          remainingBalance: wallet.currentBalance,
          isDuplicate: true
        }, 'Job already completed (Idempotent response)');
      }

      // 1. Mark Job as Completed
      job.jobStatus = 'COMPLETED';
      job.completedAt = new Date();
      job.idempotencyKey = key;
      // 2. Set 10-Minute Retention Timer for temporary photos
      const purgeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      job.photoExpiresAt = purgeExpiresAt;
      job.addStatusHistory('COMPLETED', 'Printing finished. Customer photo scheduled for 10-minute auto-purge.', 'DESKTOP_CLIENT');
      await job.save();

      // Sync associated UploadSessions to 10m retention
      await UploadSession.updateMany(
        { jobId: job._id },
        { photoExpiresAt: purgeExpiresAt }
      );

      // 3. Increment Device Metrics
      device.metrics.jobsCompleted = (device.metrics.jobsCompleted || 0) + 1;
      device.metrics.lastPrintedAt = new Date();
      await device.save();

      // 4. Atomic Credit Deduction (1 photo = 2 credits)
      const photoCount = job.itemsCount || 1;
      const creditCost = job.creditCost || photoCount * 2;
      const ledgerRes = await creditLedgerService.debitJobPrint({
        centerId: device.centerId,
        jobId: job._id,
        photoCount,
        creditCost,
        idempotencyKey: `debit_${key}`
      });

      logger.info(`[DeviceController] Job #${job.jobCode} completed. Deducted ${creditCost} credits for Center ${device.centerId}. Balance: ${ledgerRes.currentBalance}`);

      return ApiResponse.success(res, {
        jobId: job._id,
        jobStatus: job.jobStatus,
        creditsDeducted: creditCost,
        remainingBalance: ledgerRes.currentBalance,
        photoExpiresInSeconds: 600,
        isDuplicate: false
      }, 'Job marked completed and platform credits deducted');
    } catch (err) {
      logger.error(`[DeviceController] Complete job error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Auto-updater check
   * GET /api/v1/app/update
   */
  async checkUpdate(req, res) {
    try {
      const { version = '1.0.0', channel = 'stable', platform = 'win32' } = req.query;

      const latest = await UpdateRelease.findOne({
        channel,
        platform
      }).sort({ publishedAt: -1 }).lean();

      if (!latest) {
        return ApiResponse.success(res, { updateAvailable: false }, 'No updates available');
      }

      const updateAvailable = latest.version !== version;
      const isMandatory = latest.isMandatory || false;

      return ApiResponse.success(res, {
        updateAvailable,
        version: latest.version,
        downloadUrl: latest.downloadUrl,
        releaseNotes: latest.releaseNotes,
        sha512: latest.sha512,
        isMandatory,
        minimumSupportedVersion: latest.minimumSupportedVersion
      }, 'Update manifest retrieved');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }
}

module.exports = new DeviceController();
