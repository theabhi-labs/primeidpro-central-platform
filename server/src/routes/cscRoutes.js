const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const cscController = require('../controllers/cscController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['CSC', 'CSC_OPERATOR', 'ADMIN', 'SUPER_ADMIN']));

// Compatibility routes
router.get('/dashboard-stats', centerController.getDashboard);
router.get('/dashboard', centerController.getDashboard);
router.get('/jobs', centerController.getOrders);
router.get('/orders', centerController.getOrders);
router.post('/orders/:orderId/cash-received', centerController.markCashReceived);
router.post('/walk-in-order', cscController.createWalkInOrder);
router.get('/wallet', centerController.getCredits);
router.get('/credits', centerController.getCredits);
router.get('/packages', centerController.getPackages);
router.post('/pairing-code', cscController.generatePairingCode);
router.get('/kiosk-qr', centerController.getQr);
router.get('/qr', centerController.getQr);
router.post('/qr/regenerate', centerController.regenerateQr);
router.get('/service-settings', centerController.getServiceSettings);
router.put('/service-settings', centerController.updateServiceSettings);
router.get('/devices', centerController.getDevices);
router.delete('/devices/:deviceId', centerController.revokeDevice);

module.exports = router;
