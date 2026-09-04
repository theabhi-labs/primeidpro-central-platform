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

const customerController = require('../controllers/customerController');

// Authenticated device endpoints
router.post('/heartbeat', deviceAuthMiddleware, deviceController.heartbeat);
router.get('/pending-jobs', deviceAuthMiddleware, deviceController.getPendingJobs);
router.get('/jobs/pending', deviceAuthMiddleware, deviceController.getPendingJobs);
router.get('/jobs/:jobId/download-photo', deviceAuthMiddleware, deviceController.downloadJobPhoto);
router.get('/jobs/:jobId/photos/:photoIndex/download', deviceAuthMiddleware, deviceController.downloadJobPhoto);

// Photo stream
router.get('/photo-stream/*', customerController.getPhotoStream);
router.get('/photo-stream', customerController.getPhotoStream);
router.get('/stream/*', customerController.getPhotoStream);
router.get('/stream', customerController.getPhotoStream);

module.exports = router;
