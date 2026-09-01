const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const StorageDriver = require('./StorageDriver');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class R2StorageDriver extends StorageDriver {
  constructor(options = {}) {
    super('R2');
    this.endpoint = options.endpoint || env.R2_ENDPOINT;
    this.bucket = options.bucket || env.R2_BUCKET_NAME;
    this.accessKeyId = options.accessKeyId || env.R2_ACCESS_KEY_ID;
    this.secretAccessKey = options.secretAccessKey || env.R2_SECRET_ACCESS_KEY;
    this.region = options.region || env.R2_REGION || 'auto';

    this.isConfigured = Boolean(
      this.endpoint &&
      this.bucket &&
      this.accessKeyId &&
      this.secretAccessKey
    );

    if (this.isConfigured) {
      this.client = new S3Client({
        region: this.region,
        endpoint: this.endpoint,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey
        },
        forcePathStyle: true // Recommended for S3-compatible endpoints like Cloudflare R2
      });
      logger.info(`[R2StorageDriver] Initialized with bucket: ${this.bucket}`);
    } else {
      this.client = null;
      logger.warn('[R2StorageDriver] R2 credentials/endpoint are not fully configured');
    }
  }

  _ensureConfigured() {
    if (!this.isConfigured || !this.client) {
      const err = new Error('Cloudflare R2 storage driver is not configured with valid credentials/endpoint.');
      err.code = 'R2_NOT_CONFIGURED';
      throw err;
    }
  }

  async putObject({ buffer, storageKey, mimeType = 'image/jpeg', metadata = {} }) {
    this._ensureConfigured();

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
      Metadata: metadata
    });

    const response = await this.client.send(command);
    return {
      storageKey,
      sizeBytes: buffer.length,
      etag: response.ETag
    };
  }

  async getObject(storageKey) {
    this._ensureConfigured();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: storageKey
      });

      const response = await this.client.send(command);
      return {
        stream: response.Body,
        contentType: response.ContentType || 'image/jpeg',
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified
      };
    } catch (err) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        const notFoundErr = new Error(`Object not found in R2: ${storageKey}`);
        notFoundErr.code = 'ENOENT';
        throw notFoundErr;
      }
      throw err;
    }
  }

  async deleteObject(storageKey) {
    if (!storageKey) return { deleted: true, alreadyMissing: true };
    this._ensureConfigured();

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey
      });

      await this.client.send(command);
      return { deleted: true, alreadyMissing: false };
    } catch (err) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        // Idempotent success when object is already absent
        return { deleted: true, alreadyMissing: true };
      }
      logger.error(`[R2StorageDriver] Failed to delete object from R2: ${err.message}`);
      throw err;
    }
  }

  async exists(storageKey) {
    if (!storageKey || !this.isConfigured) return false;

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: storageKey
      });

      await this.client.send(command);
      return true;
    } catch (err) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      return false;
    }
  }

  async getSignedUploadUrl({ storageKey, mimeType = 'image/jpeg', expiresInSeconds = 900 }) {
    this._ensureConfigured();

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: mimeType
    });

    return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async getSignedDownloadUrl({ storageKey, expiresInSeconds = 900, originalFileName }) {
    this._ensureConfigured();

    const params = {
      Bucket: this.bucket,
      Key: storageKey
    };

    if (originalFileName) {
      params.ResponseContentDisposition = `inline; filename="${encodeURIComponent(originalFileName)}"`;
    }

    const command = new GetObjectCommand(params);
    return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async getMetadata(storageKey) {
    this._ensureConfigured();

    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: storageKey
    });

    const response = await this.client.send(command);
    return {
      contentLength: response.ContentLength || 0,
      contentType: response.ContentType || 'image/jpeg',
      lastModified: response.LastModified,
      metadata: response.Metadata
    };
  }

  async healthCheck() {
    if (!this.isConfigured) {
      return {
        status: 'NOT_CONFIGURED',
        driver: 'R2',
        error: 'R2 credentials or endpoint missing from environment'
      };
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1
      });

      await this.client.send(command);
      return {
        status: 'READY',
        driver: 'R2',
        bucket: this.bucket
      };
    } catch (err) {
      return {
        status: 'UNAVAILABLE',
        driver: 'R2',
        bucket: this.bucket,
        error: err.message
      };
    }
  }
}

module.exports = R2StorageDriver;
