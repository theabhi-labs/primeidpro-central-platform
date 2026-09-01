const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All Admin routes require authenticated ADMIN / SUPER_ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'SUPER_ADMIN']));

// Dashboard / Analytics
router.get('/dashboard', adminController.getDashboardAnalytics);
router.get('/analytics', adminController.getDashboardAnalytics);

// Centers
router.get('/centers', adminController.listCenters);
router.get('/studios', adminController.listCenters);
router.patch('/centers/:id', adminController.updateCenter);
router.patch('/studios/:id', adminController.updateCenter);

// Orders / Jobs
router.get('/orders', adminController.listOrders);
router.get('/jobs', adminController.listOrders);

// Credits Ledger & Adjustments
router.get('/credits', adminController.listCredits);
router.get('/ledger', adminController.listCredits);

// Devices
router.get('/devices', adminController.listDevices);
router.patch('/devices/:id', adminController.updateDevice);

// Credit Packages
router.get('/packages', adminController.listPackages);
router.post('/packages', adminController.createPackage);
router.put('/packages/:id', adminController.updatePackage);

// Job Rates & Pricing Matrix
router.get('/job-types', adminController.listJobTypes);
router.get('/pricing', adminController.listJobTypes);
router.put('/job-types/:id', adminController.updateJobType);
router.put('/pricing/:id', adminController.updateJobType);

// Releases
router.get('/releases', adminController.listReleases);
router.post('/releases', adminController.createRelease);

// Audit Logs
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
