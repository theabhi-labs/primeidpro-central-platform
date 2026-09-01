const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Photo upload (Temporary Object Storage)
router.post('/upload-photo', uploadLimiter, customerController.upload.single('photo'), customerController.uploadTempPhoto);

// Photo stream
router.get('/photo-stream/:storageKey', customerController.getPhotoStream);

// Service templates & pricing matrix
router.get('/templates', customerController.getServiceTemplates);

// Centers / Studios list & lookup
router.get('/centers', customerController.listCenters);
router.get('/centers/:identifier', customerController.getCenterBySlugOrCode);

// Order creation & live tracking
router.post('/orders', optionalAuth, customerController.createCustomerOrder);
router.get('/orders/track', customerController.trackOrder);

module.exports = router;
