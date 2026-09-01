const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const deviceAuthMiddleware = require('../middleware/deviceAuthMiddleware');
const { deviceLimiter } = require('../middleware/rateLimiter');

// Public device pairing & activation endpoints
router.post('/register', deviceLimiter, deviceController.registerDevice);
router.post('/pair', deviceLimiter, deviceController.registerDevice);
router.post('/activate', deviceLimiter, deviceController.activateDevice);

// Authenticated device endpoints
router.post('/heartbeat', deviceAuthMiddleware, deviceController.heartbeat);

module.exports = router;
