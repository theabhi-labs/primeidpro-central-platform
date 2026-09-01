const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const deviceAuthMiddleware = require('../middleware/deviceAuthMiddleware');

// Legacy & compatibility aliases
router.post('/device/pair', deviceController.registerDevice);
router.post('/device/heartbeat', deviceAuthMiddleware, deviceController.heartbeat);
router.get('/jobs/pending', deviceAuthMiddleware, deviceController.getPendingJobs);
router.post('/jobs/:jobId/claim', deviceAuthMiddleware, deviceController.acknowledgeJob);
router.post('/jobs/:jobId/ack', deviceAuthMiddleware, deviceController.acknowledgeJob);
router.post('/jobs/:jobId/status', deviceAuthMiddleware, deviceController.updateJobStatus);
router.post('/jobs/:jobId/complete', deviceAuthMiddleware, deviceController.completeJob);
router.get('/updates/check', deviceController.checkUpdate);
router.get('/update', deviceController.checkUpdate);

module.exports = router;
