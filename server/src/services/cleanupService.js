const Job = require('../models/Job');
const JobItem = require('../models/JobItem');
const UploadSession = require('../models/UploadSession');
const storageService = require('./storageService');
const env = require('../config/env');
const logger = require('../utils/logger');

class CleanupService {
  constructor() {
    this.intervalHandle = null;
    this.isRunning = false;
  }

  /**
   * Starts background recurring cleanup worker
   */
  start() {
    if (this.intervalHandle) return;
    logger.info(`[CleanupService] Starting background photo privacy & orphan cleanup worker (Interval: ${env.CLEANUP_INTERVAL_MS}ms)`);

    // Run immediate sweep on startup
    this.sweepAllExpiredStorage();

    // Recurring interval
    this.intervalHandle = setInterval(() => {
      this.sweepAllExpiredStorage();
    }, env.CLEANUP_INTERVAL_MS);
  }

  /**
   * Comprehensive sweep for expired job photos, abandoned uploads, and orphan sessions
   */
  async sweepAllExpiredStorage() {
    if (this.isRunning) return { skipped: true, reason: 'Already running' };
    this.isRunning = true;

    try {
      const now = new Date();
      const jobResult = await this.sweepExpiredJobPhotos(now);
      const sessionResult = await this.sweepAbandonedUploadSessions(now);

      return {
        purgedJobsCount: jobResult.purgedCount,
        failedJobsCount: jobResult.failedCount,
        purgedSessionsCount: sessionResult.purgedCount,
        failedSessionsCount: sessionResult.failedCount
      };
    } catch (err) {
      logger.error(`[CleanupService] Error during storage sweep: ${err.message}`);
      return { error: err.message };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Sweeps and purges expired photos from completed/failed jobs
   */
  async sweepExpiredJobPhotos(now = new Date()) {
    try {
      const expiredJobs = await Job.find({
        photoExpiresAt: { $lte: now },
        isPhotoPurged: false,
        $or: [
          { nextDeleteRetryAt: { $exists: false } },
          { nextDeleteRetryAt: null },
          { nextDeleteRetryAt: { $lte: now } }
        ]
      }).limit(50);

      if (expiredJobs.length === 0) {
        return { purgedCount: 0, failedCount: 0 };
      }

      logger.info(`[CleanupService] Found ${expiredJobs.length} expired customer job records to purge.`);
      let purgedCount = 0;
      let failedCount = 0;

      for (const job of expiredJobs) {
        try {
          // Collect all associated storage keys
          const keysToDelete = new Set();
          if (job.temporaryStorageKey) keysToDelete.add(job.temporaryStorageKey);
          if (job.storageKey) keysToDelete.add(job.storageKey);

          if (Array.isArray(job.itemsData)) {
            for (const item of job.itemsData) {
              if (item.storageKey) keysToDelete.add(item.storageKey);
            }
          }

          // Also check JobItem records
          const jobItems = await JobItem.find({ jobId: job._id });
          for (const item of jobItems) {
            if (item.storageKey) keysToDelete.add(item.storageKey);
          }

          // Delete each object from storage driver (idempotent)
          for (const key of keysToDelete) {
            await storageService.deletePhoto(key);
          }

          // 3. Mark purged ONLY after successful deletion
          job.isPhotoPurged = true;
          job.purgedAt = new Date();
          job.temporaryPhotoUrl = null;
          job.temporaryStorageKey = null;
          job.deleteRetryCount = 0;
          job.lastDeleteError = null;
          job.nextDeleteRetryAt = null;
          await job.save();

          // Mark individual JobItems purged
          await JobItem.updateMany(
            { jobId: job._id },
            {
              isPhotoPurged: true,
              purgedAt: new Date(),
              photoUrl: null
            }
          );

          purgedCount++;
          logger.info(`[CleanupService] Successfully purged photos for Job #${job.jobCode}`);
        } catch (jobErr) {
          failedCount++;
          const retryCount = (job.deleteRetryCount || 0) + 1;
          const backoffMs = Math.min(60 * 1000 * Math.pow(2, retryCount), 3600 * 1000); // Exponential backoff max 1hr

          job.deleteRetryCount = retryCount;
          job.lastDeleteError = jobErr.message;
          job.nextDeleteRetryAt = new Date(Date.now() + backoffMs);
          await job.save();

          logger.warn(`[CleanupService] Failed to purge photos for Job #${job.jobCode} (Attempt ${retryCount}): ${jobErr.message}`);
        }
      }

      return { purgedCount, failedCount };
    } catch (err) {
      logger.error(`[CleanupService] sweepExpiredJobPhotos error: ${err.message}`);
      return { purgedCount: 0, failedCount: 0, error: err.message };
    }
  }

  /**
   * Sweeps abandoned/unclaimed upload sessions (e.g. user closed browser without ordering)
   */
  async sweepAbandonedUploadSessions(now = new Date()) {
    try {
      const expiredSessions = await UploadSession.find({
        isPurged: false,
        photoExpiresAt: { $lte: now },
        $or: [
          { nextDeleteRetryAt: { $exists: false } },
          { nextDeleteRetryAt: null },
          { nextDeleteRetryAt: { $lte: now } }
        ]
      }).limit(50);

      if (expiredSessions.length === 0) {
        return { purgedCount: 0, failedCount: 0 };
      }

      logger.info(`[CleanupService] Found ${expiredSessions.length} expired/abandoned upload sessions to purge.`);
      let purgedCount = 0;
      let failedCount = 0;

      for (const session of expiredSessions) {
        try {
          if (session.storageKey) {
            await storageService.deletePhoto(session.storageKey);
          }

          session.isPurged = true;
          session.purgedAt = new Date();
          session.deleteRetryCount = 0;
          session.lastDeleteError = null;
          session.nextDeleteRetryAt = null;
          await session.save();

          purgedCount++;
        } catch (sessErr) {
          failedCount++;
          const retryCount = (session.deleteRetryCount || 0) + 1;
          const backoffMs = Math.min(60 * 1000 * Math.pow(2, retryCount), 3600 * 1000);

          session.deleteRetryCount = retryCount;
          session.lastDeleteError = sessErr.message;
          session.nextDeleteRetryAt = new Date(Date.now() + backoffMs);
          await session.save();

          logger.warn(`[CleanupService] Failed to purge upload session ${session.uploadSessionId}: ${sessErr.message}`);
        }
      }

      return { purgedCount, failedCount };
    } catch (err) {
      logger.error(`[CleanupService] sweepAbandonedUploadSessions error: ${err.message}`);
      return { purgedCount: 0, failedCount: 0, error: err.message };
    }
  }

  /**
   * Stops cleanup worker
   */
  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      logger.info('[CleanupService] Background cleanup worker stopped.');
    }
  }
}

const instance = new CleanupService();
instance.sweepExpiredPhotos = instance.sweepAllExpiredStorage.bind(instance);
instance.runPhotoCleanup = instance.sweepAllExpiredStorage.bind(instance);

module.exports = instance;
