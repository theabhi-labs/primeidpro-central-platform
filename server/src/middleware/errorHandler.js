const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`[UnhandledError] ${req.method} ${req.originalUrl} [ReqID: ${req.id || 'N/A'}]:`, err);

  // CORS rejection error
  if (err.message && err.message.includes('not allowed by CORS')) {
    return ApiResponse.error(res, 'Access forbidden: Origin not allowed by CORS policy', 403, null, 'CORS_REJECTED');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'record';
    return ApiResponse.error(res, `A record with this ${field} already exists.`, 409, null, 'DUPLICATE_KEY');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((el) => el.message);
    return ApiResponse.error(res, 'Database Validation Failed', 400, errors, 'VALIDATION_FAILED');
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.error(res, 'File too large. Maximum allowed size is 25MB.', 400, null, 'FILE_TOO_LARGE');
  }

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);

  // In production, never leak internal error stack traces, file paths, or credentials
  let message = err.message || 'Internal Server Error';
  if (env.IS_PRODUCTION && statusCode >= 500) {
    message = 'An unexpected server error occurred. Please try again later.';
  }

  return ApiResponse.error(res, message, statusCode, null, err.code || 'INTERNAL_ERROR');
};

module.exports = errorHandler;
