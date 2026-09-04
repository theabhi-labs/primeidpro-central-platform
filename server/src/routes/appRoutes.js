const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const deviceAuthMiddleware = require('../middleware/deviceAuthMiddleware');

// Auto-updater check (public/authenticated)
router.get('/update', deviceController.checkUpdate);

// Device Pairing & Registration
router.post('/pair', deviceController.registerDevice);
router.post('/devices/pair', deviceController.registerDevice);
router.post('/devices/register', deviceController.registerDevice);

// App Job Processing Endpoints (require device authentication)
router.get('/pending-jobs', deviceAuthMiddleware, deviceController.getPendingJobs);
router.get('/jobs/pending', deviceAuthMiddleware, deviceController.getPendingJobs);
router.post('/jobs/:jobId/ack', deviceAuthMiddleware, deviceController.acknowledgeJob);
router.post('/jobs/:jobId/status', deviceAuthMiddleware, deviceController.updateJobStatus);
router.post('/jobs/:jobId/complete', deviceAuthMiddleware, deviceController.completeJob);

const customerController = require('../controllers/customerController');

// Secure Photo Download for Desktop Clients (require device authentication)
router.get('/jobs/:jobId/download-photo', deviceAuthMiddleware, deviceController.downloadJobPhoto);
router.get('/jobs/:jobId/photos/:photoIndex/download', deviceAuthMiddleware, deviceController.downloadJobPhoto);

// Direct Photo Stream endpoints
router.get('/photo-stream/*', customerController.getPhotoStream);
router.get('/photo-stream', customerController.getPhotoStream);
router.get('/stream/*', customerController.getPhotoStream);
router.get('/stream', customerController.getPhotoStream);

module.exports = router;
