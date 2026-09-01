const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { quoteLimiter, orderLimiter } = require('../middleware/rateLimiter');

// Public Quote API
router.post('/quote', quoteLimiter, orderController.getQuote);

// Public Order Creation API
router.post('/create', orderLimiter, orderController.createOrder);

// Legacy alias for /api/v1/customer/orders
router.post('/', orderLimiter, orderController.createOrder);

// Public Order Tracking
router.get('/track/:orderId', orderController.trackOrder);
router.get('/track', (req, res) => {
  const { jobCode, orderId } = req.query;
  req.params.orderId = orderId || jobCode || '';
  return orderController.trackOrder(req, res);
});

module.exports = router;
