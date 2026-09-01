const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const StorageDriver = require('./StorageDriver');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class LocalStorageDriver extends StorageDriver {
  constructor(options = {}) {
    super('LOCAL');
    this.localDir = options.localDir || env.LOCAL_STORAGE_DIR;

    // Ensure directory exists
    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  _sanitizeKey(storageKey) {
    if (!storageKey || typeof storageKey !== 'string') {
      throw new Error('Invalid storage key provided');
    }
    // Prevent directory traversal attacks
    const normalized = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, '');
    const cleanKey = normalized.replace(/^[\/\\]+/, '');
    const fullPath = path.join(this.localDir, cleanKey);

    // Verify resolved path stays within localDir
    if (!fullPath.startsWith(path.resolve(this.localDir))) {
      throw new Error('Access denied: Storage path traversal detected');
    }
    return { cleanKey, fullPath };
  }

  async putObject({ buffer, storageKey, mimeType = 'image/jpeg' }) {
    const { cleanKey, fullPath } = this._sanitizeKey(storageKey);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, buffer);
    return {
      storageKey: cleanKey,
      sizeBytes: buffer.length
    };
  }

  async getObject(storageKey) {
    const { fullPath } = this._sanitizeKey(storageKey);
    if (!fs.existsSync(fullPath)) {
      const err = new Error('Object not found in local storage');
      err.code = 'ENOENT';
      throw err;
    }

    const stat = await fs.promises.stat(fullPath);
    const ext = path.extname(storageKey).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const stream = fs.createReadStream(fullPath);

    return {
      stream,
      contentType,
      contentLength: stat.size
    };
  }

  async deleteObject(storageKey) {
    if (!storageKey) return { deleted: true, alreadyMissing: true };
    try {
      const { fullPath } = this._sanitizeKey(storageKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return { deleted: true, alreadyMissing: false };
      }
      return { deleted: true, alreadyMissing: true };
    } catch (err) {
      if (err.code === 'ENOENT') {
        return { deleted: true, alreadyMissing: true };
      }
      logger.error(`[LocalStorageDriver] Failed to delete ${storageKey}:`, err);
      throw err;
    }
  }

  async exists(storageKey) {
    try {
      const { fullPath } = this._sanitizeKey(storageKey);
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  }

  async getSignedUploadUrl({ storageKey, mimeType, expiresInSeconds = 900 }) {
    const { cleanKey } = this._sanitizeKey(storageKey);
    // In local mode, upload target is the server upload endpoint
    return `/api/v1/customer/upload-photo?storageKey=${encodeURIComponent(cleanKey)}`;
  }

  async getSignedDownloadUrl({ storageKey, expiresInSeconds = 900 }) {
    const { cleanKey } = this._sanitizeKey(storageKey);
    // Generate secure HMAC signature with expiration
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const hmac = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(`${cleanKey}:${expiresAt}`)
      .digest('hex');

    return `/api/v1/customer/photo-stream/${encodeURIComponent(cleanKey)}?exp=${expiresAt}&sig=${hmac}`;
  }

  async getMetadata(storageKey) {
    const { fullPath } = this._sanitizeKey(storageKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error('Object not found in local storage');
    }
    const stat = await fs.promises.stat(fullPath);
    const ext = path.extname(storageKey).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    return {
      contentLength: stat.size,
      contentType,
      lastModified: stat.mtime
    };
  }

  async healthCheck() {
    try {
      if (!fs.existsSync(this.localDir)) {
        fs.mkdirSync(this.localDir, { recursive: true });
      }
      // Test write and delete
      const testFile = path.join(this.localDir, `.health_${Date.now()}.tmp`);
      await fs.promises.writeFile(testFile, 'health');
      await fs.promises.unlink(testFile);

      return {
        status: 'READY',
        driver: 'LOCAL',
        directory: this.localDir
      };
    } catch (err) {
      return {
        status: 'UNAVAILABLE',
        driver: 'LOCAL',
        error: err.message
      };
    }
  }
}

module.exports = LocalStorageDriver;
