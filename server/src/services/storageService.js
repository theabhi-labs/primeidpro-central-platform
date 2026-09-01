const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const logger = require('../utils/logger');
const LocalStorageDriver = require('./storage/LocalStorageDriver');
const R2StorageDriver = require('./storage/R2StorageDriver');
const UploadSession = require('../models/UploadSession');

class StorageService {
  constructor() {
    this.driverType = env.STORAGE_DRIVER;
    this._initializeDriver();
  }

  _initializeDriver() {
    if (this.driverType === 'R2' || (env.IS_PRODUCTION && this.driverType !== 'LOCAL')) {
      this.driver = new R2StorageDriver({
        endpoint: env.R2_ENDPOINT,
        bucket: env.R2_BUCKET_NAME,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        region: env.R2_REGION
      });
      logger.info(`[StorageService] Active storage driver: Cloudflare R2 (${env.R2_BUCKET_NAME})`);
    } else {
      this.driver = new LocalStorageDriver({
        localDir: env.LOCAL_STORAGE_DIR
      });
      logger.info(`[StorageService] Active storage driver: Local Storage (${env.LOCAL_STORAGE_DIR})`);
    }
  }

  /**
   * Generates a cryptographically random, collision-resistant, unpredictable server storage key.
   * Path traversal resistant; original user filenames are strictly excluded.
   *
   * Pattern: temp-photos/YYYY/MM/DD/center_<centerId>/<randomBytes16>.jpg
   */
  generateStorageKey(options = {}) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const centerSegment = options.centerId
      ? `center_${String(options.centerId).replace(/[^a-zA-Z0-9_-]/g, '')}`
      : 'unassigned';

    const randomId = crypto.randomBytes(16).toString('hex');
    const ext = options.fileExtension
      ? (options.fileExtension.startsWith('.') ? options.fileExtension : `.${options.fileExtension}`).toLowerCase()
      : '.jpg';

    // Safe extension whitelist
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';

    return `temp-photos/${year}/${month}/${day}/${centerSegment}/${randomId}${safeExt}`;
  }

  /**
   * Uploads a customer photo to storage and records a temporary UploadSession for orphan tracking.
   * @param {Buffer} buffer - Image file buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - Image mime type
   * @param {Object} [options] - Additional metadata
   * @returns {Promise<{ uploadSessionId: string, storageKey: string, photoUrl: string, sizeBytes: number, expiresInMinutes: number }>}
   */
  async uploadTemporaryPhoto(buffer, originalName, mimeType = 'image/jpeg', options = {}) {
    if (!buffer || buffer.length === 0) {
      throw new Error('Cannot upload empty photo buffer');
    }

    // Enforce max upload size (25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      throw new Error('Photo exceeds maximum allowed size of 25MB');
    }

    const ext = path.extname(originalName || '').toLowerCase() || '.jpg';
    const storageKey = this.generateStorageKey({
      centerId: options.centerId,
      fileExtension: ext
    });

    // 1. Upload to active storage driver
    const uploadResult = await this.driver.putObject({
      buffer,
      storageKey,
      mimeType,
      metadata: {
        originalName: (originalName || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, ''),
        uploadedAt: new Date().toISOString()
      }
    });

    const uploadSessionId = `sess_${uuidv4()}`;
    const expiresInHours = env.UPLOAD_RETENTION_HOURS || 2;
    const photoExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // 2. Record UploadSession in MongoDB for deterministic orphan cleanup
    try {
      await UploadSession.create({
        uploadSessionId,
        storageKey,
        originalFileName: originalName || 'photo.jpg',
        mimeType,
        fileSize: buffer.length,
        centerId: options.centerId || null,
        isClaimed: false,
        photoExpiresAt
      });
    } catch (dbErr) {
      logger.error(`[StorageService] Failed to record upload session: ${dbErr.message}`);
    }

    // 3. Generate short-lived signed access URL for preview
    const photoUrl = await this.getSignedDownloadUrl({
      storageKey,
      expiresInSeconds: env.SIGNED_URL_EXPIRES_SECONDS || 900,
      originalFileName: originalName
    });

    return {
      uploadSessionId,
      storageKey,
      photoUrl,
      sizeBytes: buffer.length,
      expiresInMinutes: expiresInHours * 60
    };
  }

  /**
   * Generates a short-lived presigned download URL for private photo access.
   */
  async getSignedDownloadUrl({ storageKey, expiresInSeconds = 900, originalFileName }) {
    if (!storageKey) return null;
    return await this.driver.getSignedDownloadUrl({
      storageKey,
      expiresInSeconds,
      originalFileName
    });
  }

  /**
   * Generates a short-lived presigned upload URL for direct-to-R2 upload.
   */
  async getSignedUploadUrl({ storageKey, mimeType = 'image/jpeg', expiresInSeconds = 900 }) {
    return await this.driver.getSignedUploadUrl({
      storageKey,
      mimeType,
      expiresInSeconds
    });
  }

  /**
   * Retrieves object stream from storage driver
   */
  async getObject(storageKey) {
    return await this.driver.getObject(storageKey);
  }

  /**
   * Synchronous/stream helper for backward compatibility
   */
  getPhotoStream(storageKey) {
    if (this.driver instanceof LocalStorageDriver) {
      try {
        const { fullPath } = this.driver._sanitizeKey(storageKey);
        const fs = require('fs');
        if (!fs.existsSync(fullPath)) return null;
        return fs.createReadStream(fullPath);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Deletes a photo from storage driver idempotently and marks upload session purged
   * @param {string} storageKey
   * @returns {Promise<{ deleted: boolean, alreadyMissing: boolean }>}
   */
  async deletePhoto(storageKey) {
    if (!storageKey) return { deleted: true, alreadyMissing: true };

    try {
      const result = await this.driver.deleteObject(storageKey);

      // Mark UploadSession as purged
      await UploadSession.updateMany(
        { storageKey },
        {
          isPurged: true,
          purgedAt: new Date(),
          deleteRetryCount: 0,
          lastDeleteError: null
        }
      );

      return result;
    } catch (err) {
      logger.error(`[StorageService] Failed to delete photo ${storageKey}:`, err);
      // Record failure on UploadSession for retry
      await UploadSession.updateMany(
        { storageKey },
        {
          $inc: { deleteRetryCount: 1 },
          lastDeleteError: err.message,
          nextDeleteRetryAt: new Date(Date.now() + 60 * 1000)
        }
      );
      throw err;
    }
  }

  /**
   * Checks if an object exists in storage
   */
  async exists(storageKey) {
    return await this.driver.exists(storageKey);
  }

  /**
   * Associates an UploadSession with a placed Job & Order
   */
  async claimUploadSession(storageKey, { jobId, orderId, centerId }) {
    if (!storageKey) return null;
    return await UploadSession.findOneAndUpdate(
      { storageKey },
      {
        isClaimed: true,
        claimedAt: new Date(),
        jobId,
        orderId,
        ...(centerId && { centerId })
      },
      { new: true }
    );
  }

  /**
   * Calculates storage diagnostics & metrics
   */
  async getStorageStats() {
    try {
      const totalSessions = await UploadSession.countDocuments();
      const activeUnclaimed = await UploadSession.countDocuments({ isClaimed: false, isPurged: false });
      const purgedSessions = await UploadSession.countDocuments({ isPurged: true });

      const health = await this.driver.healthCheck();

      return {
        driver: this.driver.name,
        health: health.status,
        bucket: health.bucket || 'LOCAL_DISK',
        totalUploadSessions: totalSessions,
        activeUnclaimedSessions: activeUnclaimed,
        purgedSessions,
        retentionMinutes: env.PHOTO_RETENTION_MINUTES,
        uploadRetentionHours: env.UPLOAD_RETENTION_HOURS
      };
    } catch (err) {
      logger.error('[StorageService] Error getting storage stats:', err);
      return {
        driver: this.driver?.name || env.STORAGE_DRIVER,
        health: 'UNAVAILABLE',
        error: err.message
      };
    }
  }

  /**
   * Storage connectivity and configuration health check
   */
  async healthCheck() {
    return await this.driver.healthCheck();
  }
}

module.exports = new StorageService();
