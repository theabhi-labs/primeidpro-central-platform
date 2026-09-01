const User = require('../models/User');
const Center = require('../models/Center');
const CreditWallet = require('../models/CreditWallet');
const AuditLog = require('../models/AuditLog');
const { signToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const crypto = require('crypto');

class AuthController {
  /**
   * CSC Studio Partner Registration
   * POST /api/v1/auth/csc/register (or /api/v1/auth/register)
   */
  async registerCsc(req, res) {
    try {
      const {
        ownerName,
        name,
        centerName,
        mobile,
        phone,
        email,
        password,
        confirmPassword,
        address,
        city,
        state = 'Delhi',
        pincode
      } = req.body;

      const userName = ownerName || name;
      const userPhone = mobile || phone;

      if (!userName || !email || !password) {
        return ApiResponse.error(res, 'Name, email, and password are required', 400);
      }

      if (confirmPassword && password !== confirmPassword) {
        return ApiResponse.error(res, 'Passwords do not match', 400);
      }

      if (password.length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
      }

      // Check existing email
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return ApiResponse.error(res, 'An account with this email already exists', 409);
      }

      // 1. Hash password
      const passwordHash = await User.hashPassword(password);

      // 2. Create User
      const user = await User.create({
        name: userName,
        email: email.toLowerCase().trim(),
        mobile: userPhone,
        phone: userPhone,
        passwordHash,
        role: 'CSC',
        status: 'ACTIVE',
        lastLoginAt: new Date()
      });

      // 3. Create Center
      const centerCode = `CSC-${(city || 'DL').substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const center = await Center.create({
        ownerId: user._id,
        centerName: centerName || `${userName}'s Photo Studio`,
        centerCode,
        address: address || 'Main Market',
        city: city || 'New Delhi',
        state: state || 'Delhi',
        pincode: pincode || '110001',
        phone: userPhone,
        email: email.toLowerCase().trim(),
        status: 'ACTIVE',
        walletBalance: 100, // 100 complimentary starter credits
        serviceSettings: {
          serviceEnabled: true,
          pricePerPhoto: 7,
          minimumQuantity: 3,
          maximumQuantity: 20,
          quantityStep: 1,
          onlinePaymentEnabled: true,
          cashPaymentEnabled: true
        }
      });

      // Bind center to user
      user.centerId = center._id;
      await user.save();

      // 4. Create CreditWallet with starter credits
      const wallet = await CreditWallet.create({
        centerId: center._id,
        currentBalance: 100,
        lifetimePurchased: 100,
        lifetimeUsed: 0
      });

      // 5. Generate JWT
      const token = signToken({
        id: user._id,
        role: user.role,
        centerId: center._id
      });

      // Audit Log
      await AuditLog.create({
        action: 'CSC_REGISTERED',
        performedBy: user._id,
        performedByRole: 'CSC',
        targetType: 'CENTER',
        targetId: center._id,
        details: { centerCode, email: user.email },
        ipAddress: req.ip
      });

      logger.info(`[AuthController] New CSC registered: ${center.centerName} (${center.centerCode}) by ${user.email}`);

      return ApiResponse.created(res, {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          centerId: center._id
        },
        center: {
          id: center._id,
          centerName: center.centerName,
          centerCode: center.centerCode,
          qrToken: center.qrToken,
          walletBalance: wallet.currentBalance
        }
      }, 'CSC partner registered successfully');
    } catch (err) {
      logger.error(`[AuthController] Registration error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * CSC Studio Partner Login
   * POST /api/v1/auth/csc/login (or /api/v1/auth/login)
   */
  async loginCsc(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return ApiResponse.error(res, 'Email and password must be valid strings', 400);
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return ApiResponse.error(res, 'Invalid email or password', 401);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid email or password', 401);
      }

      if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
        return ApiResponse.error(res, 'Your account has been suspended. Please contact support.', 403);
      }

      user.lastLoginAt = new Date();
      await user.save();

      const center = user.centerId ? await Center.findById(user.centerId) : null;
      let wallet = null;
      if (center) {
        wallet = await CreditWallet.findOne({ centerId: center._id });
      }

      const token = signToken({
        id: user._id,
        role: user.role,
        centerId: center?._id || null
      });

      return ApiResponse.success(res, {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          centerId: center?._id || null
        },
        center: center ? {
          id: center._id,
          centerName: center.centerName,
          centerCode: center.centerCode,
          qrToken: center.qrToken,
          walletBalance: wallet ? wallet.currentBalance : center.walletBalance
        } : null
      }, 'Login successful');
    } catch (err) {
      logger.error(`[AuthController] Login error: ${err.message}`);
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Super Admin Login
   * POST /api/v1/auth/admin/login
   */
  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return ApiResponse.error(res, 'Email and password must be valid strings', 400);
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return ApiResponse.error(res, 'Invalid administrative credentials', 401);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid administrative credentials', 401);
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = signToken({
        id: user._id,
        role: user.role,
        centerId: null
      });

      logger.info(`[AuthController] Admin login: ${user.email}`);

      return ApiResponse.success(res, {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }, 'Admin login successful');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Authenticated user profile
   * GET /api/v1/auth/me
   */
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      let center = null;
      let wallet = null;
      if (user.centerId) {
        center = await Center.findById(user.centerId);
        if (center) {
          wallet = await CreditWallet.findOne({ centerId: center._id });
        }
      }

      return ApiResponse.success(res, {
        user,
        center: center ? {
          ...center.toObject(),
          walletBalance: wallet ? wallet.currentBalance : center.walletBalance
        } : null,
        wallet
      }, 'Profile retrieved');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Password reset request
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return ApiResponse.error(res, 'A valid email string is required', 400);
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        const resetToken = crypto.randomBytes(24).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
      }

      // Generic response to prevent account enumeration
      return ApiResponse.success(res, null, 'If an account exists with this email, password reset instructions have been dispatched.');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }

  /**
   * Password reset confirmation
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;

      if (!token || !password) {
        return ApiResponse.error(res, 'Token and new password are required', 400);
      }

      if (confirmPassword && password !== confirmPassword) {
        return ApiResponse.error(res, 'Passwords do not match', 400);
      }

      if (password.length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return ApiResponse.error(res, 'Password reset token is invalid or has expired', 400);
      }

      user.passwordHash = await User.hashPassword(password);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return ApiResponse.success(res, null, 'Password has been reset successfully. Please log in with your new password.');
    } catch (err) {
      return ApiResponse.error(res, err.message, 500);
    }
  }
}

module.exports = new AuthController();
