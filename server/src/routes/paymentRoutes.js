const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Customer Job Payment
router.post(
  '/create-order',
  paymentController.createPaymentOrder.bind(paymentController)
);
router.post(
  '/verify-payment',
  paymentController.verifyPayment.bind(paymentController)
);

// CSC Wallet Recharge
router.post(
  '/wallet-order',
  authMiddleware,
  roleMiddleware(['CSC', 'CSC_OPERATOR', 'ADMIN', 'SUPER_ADMIN']),
  paymentController.createWalletTopupOrder.bind(paymentController)
);
router.post(
  '/verify-wallet-topup',
  authMiddleware,
  roleMiddleware(['CSC', 'CSC_OPERATOR', 'ADMIN', 'SUPER_ADMIN']),
  paymentController.verifyWalletTopup.bind(paymentController)
);

module.exports = router;
