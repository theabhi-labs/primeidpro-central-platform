const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    timestamp: new Date().toISOString()
  }
});

// Strict auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes',
    timestamp: new Date().toISOString()
  }
});

// Photo upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: 'Photo upload rate limit exceeded. Please wait a few minutes.',
    timestamp: new Date().toISOString()
  }
});

// Quote API rate limiter
const quoteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Quote rate limit exceeded. Please wait a few minutes.',
    timestamp: new Date().toISOString()
  }
});

// Order Creation rate limiter
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Order creation rate limit exceeded.',
    timestamp: new Date().toISOString()
  }
});

// Desktop client sync rate limiter (Permissive for heartbeats)
const deviceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Device rate limit exceeded.',
    timestamp: new Date().toISOString()
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  quoteLimiter,
  orderLimiter,
  deviceLimiter
};
