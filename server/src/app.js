const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const crypto = require('crypto');
const mongoSanitize = require('express-mongo-sanitize');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const ApiResponse = require('./utils/apiResponse');

// Routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const centerRoutes = require('./routes/centerRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const appRoutes = require('./routes/appRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Compatibility Aliases
const customerRoutes = require('./routes/customerRoutes');
const cscRoutes = require('./routes/cscRoutes');
const desktopRoutes = require('./routes/desktopRoutes');

const app = express();

// Trust Proxy (Required for Render, Cloudflare, and NGINX reverse proxies)
app.set('trust proxy', 1);

// Request Correlation ID Middleware
app.use((req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const requestId = (typeof incomingId === 'string' && incomingId.length <= 64)
    ? incomingId.replace(/[^a-zA-Z0-9_-]/g, '')
    : crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});

// Security Headers (compatible with React Vite SPA and cross-origin resource loading)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allows Vite SPA scripts and external assets
  })
);

// CORS Hardening — Strict Origin Whitelisting
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://primeidpro.online',
  'https://www.primeidpro.online',
  ...env.CORS_ORIGINS
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Electron desktop, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const corsErr = new Error(`Origin ${origin} is not allowed by CORS policy.`);
      corsErr.statusCode = 403;
      return callback(corsErr);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Device-Id',
      'X-Installation-Id',
      'X-Device-Token',
      'X-App-Version',
      'X-Razorpay-Signature',
      'X-Request-Id'
    ]
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// JSON & URL-encoded Body Parser with raw body preservation for webhooks
app.use(
  express.json({
    limit: '25mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// NoSQL Injection Protection — Sanitize req.body, req.query, req.params
app.use(
  mongoSanitize({
    replaceWith: '_'
  })
);

// Apply rate limiter to general API
app.use('/api/', apiLimiter);

// Standard API Routes
app.use('/api/v1/health', healthRoutes);
app.get('/api/v1/ready', (req, res, next) => {
  req.url = '/ready';
  healthRoutes(req, res, next);
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/centers', centerRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/app', appRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Compatibility Alias Routes
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/csc', cscRoutes);
app.use('/api/v1/desktop', desktopRoutes);

// Public Web Route Redirects (in case customer scans QR pointing to backend API domain)
app.get(['/kiosk/:slug', '/kiosk', '/order/:token', '/order', '/track/:orderId', '/track'], (req, res) => {
  const clientBase = env.CLIENT_URL || 'https://primeidpro.online';
  return res.redirect(302, `${clientBase}${req.originalUrl}`);
});

// Root greeting
app.get('/', (req, res) => {
  return ApiResponse.success(res, {
    platform: 'PRIME ID PRO Central Web Platform',
    domain: 'https://primeidpro.online',
    version: '1.0.0',
    status: 'ONLINE',
    documentation: '/api/v1/health'
  });
});

// 404 handler
app.use((req, res) => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, null, 'NOT_FOUND');
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
