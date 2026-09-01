const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

// In production, in-memory DB fallback is strictly disabled to prevent volatile data loss.
// In development, it is allowed ONLY if explicitly set to 'true'.
// In test mode, memory DB can be used if enabled or configured for isolation.
const useMemoryFallback = !isProduction && (process.env.USE_MEMORY_DB_FALLBACK === 'true' || isTest);

// Storage driver selection:
// In production, defaults to 'R2' (Cloudflare R2 Object Storage).
// In development/test, defaults to 'LOCAL' unless explicitly specified.
const defaultStorageDriver = isProduction ? 'R2' : 'LOCAL';
const storageDriver = (process.env.STORAGE_DRIVER || defaultStorageDriver).toUpperCase();

// Cloudflare R2 / S3-compatible configuration
const r2Endpoint = process.env.R2_ENDPOINT || process.env.S3_ENDPOINT || '';
const r2BucketName = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'primeidpro-temp-photos';
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || '';
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || '';
const r2Region = process.env.R2_REGION || process.env.S3_REGION || 'auto';
const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL || '';

// JWT & Security Secrets
// In production, secrets MUST be supplied via environment variables; fallback is strictly disabled.
const jwtSecret = isProduction
  ? process.env.JWT_SECRET
  : (process.env.JWT_SECRET || 'primeidpro_super_secret_jwt_key_2026_production_grade_9988');

const deviceJwtSecret = isProduction
  ? process.env.DEVICE_JWT_SECRET
  : (process.env.DEVICE_JWT_SECRET || 'primeidpro_device_token_secret_key_2026_secure');

// Razorpay Secrets
const razorpayKeyId = isProduction
  ? process.env.RAZORPAY_KEY_ID
  : (process.env.RAZORPAY_KEY_ID || 'rzp_test_PrimeIdProSandbox2026');

const razorpayKeySecret = isProduction
  ? process.env.RAZORPAY_KEY_SECRET
  : (process.env.RAZORPAY_KEY_SECRET || 'PrimeIdProSandboxSecretKey2026');

const razorpayWebhookSecret = isProduction
  ? process.env.RAZORPAY_WEBHOOK_SECRET
  : (process.env.RAZORPAY_WEBHOOK_SECRET || 'PrimeIdProWebhookSecret2026');

// Payment test mode: In production, strictly false by default unless explicitly verified
const paymentTestMode = isProduction
  ? false
  : (process.env.PAYMENT_TEST_MODE !== 'false');

module.exports = {
  NODE_ENV: nodeEnv,
  IS_PRODUCTION: isProduction,
  IS_TEST: isTest,
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || (isProduction ? 'https://primeidpro.online' : 'http://localhost:5173'),
  DOMAIN: process.env.DOMAIN || (isProduction ? 'https://primeidpro.online' : 'http://localhost:5000'),
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()) : [],

  // Database
  MONGODB_URI: process.env.MONGODB_URI || (isProduction ? '' : 'mongodb://127.0.0.1:27017/primeidpro'),
  USE_MEMORY_DB_FALLBACK: useMemoryFallback,

  // JWT
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DEVICE_JWT_SECRET: deviceJwtSecret,

  // Razorpay
  RAZORPAY_KEY_ID: razorpayKeyId,
  RAZORPAY_KEY_SECRET: razorpayKeySecret,
  RAZORPAY_WEBHOOK_SECRET: razorpayWebhookSecret,
  PAYMENT_TEST_MODE: paymentTestMode,

  // Storage
  STORAGE_DRIVER: storageDriver, // 'R2' | 'LOCAL' | 'S3'
  LOCAL_STORAGE_DIR: process.env.LOCAL_STORAGE_DIR || path.resolve(__dirname, '../../temp_storage'),
  PHOTO_RETENTION_MINUTES: parseInt(process.env.PHOTO_RETENTION_MINUTES || '10', 10),
  UPLOAD_RETENTION_HOURS: parseInt(process.env.UPLOAD_RETENTION_HOURS || '2', 10),
  SIGNED_URL_EXPIRES_SECONDS: parseInt(process.env.SIGNED_URL_EXPIRES_SECONDS || '900', 10), // 15 minutes
  CLEANUP_INTERVAL_MS: parseInt(process.env.CLEANUP_INTERVAL_MS || '60000', 10), // 1 minute interval

  // Cloudflare R2 Credentials & Endpoint
  R2_ENDPOINT: r2Endpoint,
  R2_BUCKET_NAME: r2BucketName,
  R2_ACCESS_KEY_ID: r2AccessKeyId,
  R2_SECRET_ACCESS_KEY: r2SecretAccessKey,
  R2_REGION: r2Region,
  R2_PUBLIC_BASE_URL: r2PublicBaseUrl,

  // Backward-compatibility aliases
  S3_ENDPOINT: r2Endpoint,
  S3_BUCKET_NAME: r2BucketName,
  S3_ACCESS_KEY: r2AccessKeyId,
  S3_SECRET_KEY: r2SecretAccessKey,
  S3_REGION: r2Region,

  /**
   * Checks if R2 configuration has all required non-empty parameters
   */
  isR2Configured() {
    return Boolean(
      this.R2_ENDPOINT &&
      this.R2_BUCKET_NAME &&
      this.R2_ACCESS_KEY_ID &&
      this.R2_SECRET_ACCESS_KEY
    );
  },

  /**
   * Comprehensive validation of production environment configuration.
   * Fails fast if any mandatory secret or setting is insecure or missing.
   * @param {Object} [options]
   * @param {boolean} [options.throwOnFailure=false]
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateProductionConfig(options = {}) {
    const errors = [];

    // Only strictly enforce full production rules in production mode
    const envIsProd = options.forceProd !== undefined ? options.forceProd : this.IS_PRODUCTION;
    if (!envIsProd) {
      return { valid: true, errors: [] };
    }

    // 1. Database
    if (!this.MONGODB_URI) {
      errors.push('MONGODB_URI is required in production.');
    } else if (this.MONGODB_URI.includes('127.0.0.1') || this.MONGODB_URI.includes('localhost')) {
      errors.push('Local database URI (localhost/127.0.0.1) cannot be used in production.');
    }

    if (this.USE_MEMORY_DB_FALLBACK) {
      errors.push('USE_MEMORY_DB_FALLBACK must be false in production.');
    }

    // 2. Secrets
    if (!this.JWT_SECRET) {
      errors.push('JWT_SECRET is required in production.');
    } else if (this.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production.');
    }

    if (!this.DEVICE_JWT_SECRET) {
      errors.push('DEVICE_JWT_SECRET is required in production.');
    } else if (this.DEVICE_JWT_SECRET.length < 32) {
      errors.push('DEVICE_JWT_SECRET must be at least 32 characters in production.');
    }

    // 3. Payment
    if (this.PAYMENT_TEST_MODE === true) {
      errors.push('PAYMENT_TEST_MODE must be false in production.');
    }

    // 4. Domains & HTTPS
    if (this.CLIENT_URL && !this.CLIENT_URL.startsWith('https://')) {
      errors.push('CLIENT_URL must use HTTPS in production.');
    }
    if (this.DOMAIN && !this.DOMAIN.startsWith('https://')) {
      errors.push('DOMAIN must use HTTPS in production.');
    }

    // 5. Cloudflare R2
    if (this.STORAGE_DRIVER === 'R2') {
      if (!this.isR2Configured()) {
        errors.push('Cloudflare R2 is set as STORAGE_DRIVER but R2 credentials/endpoint are missing.');
      }
    }

    const valid = errors.length === 0;
    if (!valid && options.throwOnFailure) {
      throw new Error(`Production Configuration Validation Failed:\n- ${errors.join('\n- ')}`);
    }

    return { valid, errors };
  }
};
