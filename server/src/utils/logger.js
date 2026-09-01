const redactSensitive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  const sensitiveKeys = ['password', 'token', 'authToken', 'secret', 'signature', 'razorpaySignature', 'key_secret', 'data'];

  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = redactSensitive(clone[key]);
    }
  }
  return clone;
};

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(redactSensitive(meta)) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(redactSensitive(meta)) : '');
  },
  error: (message, error = null, meta = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error ? error.stack || error.message || error : '', Object.keys(meta).length ? JSON.stringify(redactSensitive(meta)) : '');
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? JSON.stringify(redactSensitive(meta)) : '');
    }
  }
};

module.exports = logger;
