/**
 * Base Abstract StorageDriver Interface
 */
class StorageDriver {
  constructor(name) {
    this.name = name;
  }

  /**
   * Uploads an object buffer to storage
   * @param {Object} params
   * @param {Buffer} params.buffer
   * @param {string} params.storageKey
   * @param {string} params.mimeType
   * @param {Object} [params.metadata]
   * @returns {Promise<{ storageKey: string, sizeBytes: number, etag?: string }>}
   */
  async putObject(params) {
    throw new Error(`putObject() not implemented in ${this.name}`);
  }

  /**
   * Reads an object from storage
   * @param {string} storageKey
   * @returns {Promise<{ stream?: import('stream').Readable, buffer?: Buffer, contentType: string, contentLength: number }>}
   */
  async getObject(storageKey) {
    throw new Error(`getObject() not implemented in ${this.name}`);
  }

  /**
   * Deletes an object from storage idempotently
   * @param {string} storageKey
   * @returns {Promise<{ deleted: boolean, alreadyMissing: boolean }>}
   */
  async deleteObject(storageKey) {
    throw new Error(`deleteObject() not implemented in ${this.name}`);
  }

  /**
   * Checks if an object exists in storage
   * @param {string} storageKey
   * @returns {Promise<boolean>}
   */
  async exists(storageKey) {
    throw new Error(`exists() not implemented in ${this.name}`);
  }

  /**
   * Generates a short-lived presigned upload URL
   * @param {Object} params
   * @param {string} params.storageKey
   * @param {string} params.mimeType
   * @param {number} [params.expiresInSeconds]
   * @returns {Promise<string>}
   */
  async getSignedUploadUrl(params) {
    throw new Error(`getSignedUploadUrl() not implemented in ${this.name}`);
  }

  /**
   * Generates a short-lived presigned download URL
   * @param {Object} params
   * @param {string} params.storageKey
   * @param {number} [params.expiresInSeconds]
   * @param {string} [params.originalFileName]
   * @returns {Promise<string>}
   */
  async getSignedDownloadUrl(params) {
    throw new Error(`getSignedDownloadUrl() not implemented in ${this.name}`);
  }

  /**
   * Gets object metadata
   * @param {string} storageKey
   * @returns {Promise<{ contentLength: number, contentType: string, lastModified: Date, metadata?: Object }>}
   */
  async getMetadata(storageKey) {
    throw new Error(`getMetadata() not implemented in ${this.name}`);
  }

  /**
   * Verifies storage driver connectivity & configuration
   * @returns {Promise<{ status: 'READY' | 'NOT_CONFIGURED' | 'UNAVAILABLE', driver: string, bucket?: string, error?: string }>}
   */
  async healthCheck() {
    throw new Error(`healthCheck() not implemented in ${this.name}`);
  }
}

module.exports = StorageDriver;
