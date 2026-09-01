const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Registration
router.post('/csc/register', authLimiter, authController.registerCsc);
router.post('/register', authLimiter, authController.registerCsc);

// Login
router.post('/csc/login', authLimiter, authController.loginCsc);
router.post('/admin/login', authLimiter, authController.loginAdmin);
router.post('/login', authLimiter, authController.loginCsc);

// Forgot & Reset Password
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Profile
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
