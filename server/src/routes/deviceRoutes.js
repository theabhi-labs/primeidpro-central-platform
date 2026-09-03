const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const deviceAuthMiddleware = require('../middleware/deviceAuthMiddleware');
const { deviceLimiter } = require('../middleware/rateLimiter');

// Public device pairing & activation endpoints
router.post('/register', deviceLimiter, deviceController.registerDevice);
router.post('/pair', deviceLimiter, deviceController.registerDevice);
router.post('/activate', deviceLimiter, deviceController.activateDevice);
router.post('/sync-wallet', deviceController.syncWallet);

// Authenticated device endpoints
router.post('/heartbeat', deviceAuthMiddleware, deviceController.heartbeat);
router.get('/pending-jobs', deviceAuthMiddleware, deviceController.getPendingJobs);
router.get('/jobs/pending', deviceAuthMiddleware, deviceController.getPendingJobs);

module.exports = router;
