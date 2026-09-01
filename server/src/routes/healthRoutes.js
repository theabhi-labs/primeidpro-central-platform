const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const storageService = require('../services/storageService');
const ApiResponse = require('../utils/apiResponse');
const env = require('../config/env');

/**
 * Liveness Probe: GET /api/v1/health
 * Returns 200 if the HTTP process is running.
 */
router.get('/', (req, res) => {
  return ApiResponse.success(
    res,
    {
      platform: 'PRIME ID PRO Central Web Platform',
      domain: env.DOMAIN,
      status: 'HEALTHY',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    },
    'Liveness probe OK'
  );
});

/**
 * Readiness Probe: GET /api/v1/health/ready (also aliased at /api/v1/ready)
 * Validates connectivity to critical upstream services (MongoDB and active Storage Driver).
 * Returns HTTP 200 when ready to accept traffic, or HTTP 503 when dependencies are failing.
 */
router.get('/ready', async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const storageHealth = await storageService.healthCheck();
  const isStorageReady = storageHealth.status === 'READY';

  const isReady = isDbConnected && isStorageReady;

  const payload = {
    ready: isReady,
    status: isReady ? 'READY' : 'NOT_READY',
    checks: {
      database: {
        status: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
        readyState: mongoose.connection.readyState
      },
      storage: {
        driver: storageHealth.driver,
        status: storageHealth.status,
        ...(storageHealth.error && { error: storageHealth.error })
      }
    },
    timestamp: new Date().toISOString()
  };

  if (isReady) {
    return ApiResponse.success(res, payload, 'Service is ready to handle traffic');
  } else {
    return res.status(503).json({
      success: false,
      message: 'Service is not ready: critical dependencies unavailable',
      data: payload,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
