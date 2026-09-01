const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All Center routes require authenticated CSC operator or Admin
router.use(authMiddleware);
router.use(roleMiddleware(['CSC', 'CSC_OPERATOR', 'ADMIN', 'SUPER_ADMIN']));

// Center Profile
router.get('/me', centerController.getCenterProfile);
router.get('/profile', centerController.getCenterProfile);

// Dashboard
router.get('/dashboard', centerController.getDashboard);

// Orders & Cash Confirmation
router.get('/orders', centerController.getOrders);
router.post('/orders/:orderId/cash-received', centerController.markCashReceived);

// Credits & Packages
router.get('/credits', centerController.getCredits);
router.get('/packages', centerController.getPackages);

// Photo Service Configuration
router.get('/service-settings', centerController.getServiceSettings);
router.put('/service-settings', centerController.updateServiceSettings);

// QR System
router.get('/qr', centerController.getQr);
router.post('/qr/regenerate', centerController.regenerateQr);

// Connected Desktop Devices
router.get('/devices', centerController.getDevices);
router.delete('/devices/:deviceId', centerController.revokeDevice);

module.exports = router;
