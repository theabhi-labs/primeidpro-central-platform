const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { quoteLimiter } = require('../middleware/rateLimiter');

router.get('/qr/:qrToken', quoteLimiter, publicController.resolveQr);
router.get('/templates', publicController.getTemplates);
router.get('/packages', publicController.getPackages);

module.exports = router;
