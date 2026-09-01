const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Razorpay Webhook receiver
router.post('/razorpay', webhookController.handleRazorpayWebhook);

module.exports = router;
