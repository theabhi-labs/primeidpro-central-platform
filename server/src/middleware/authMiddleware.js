const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(res, 'User account not found', 401);
    }

    if (user.status !== 'ACTIVE') {
      return ApiResponse.error(res, `Account is ${user.status.toLowerCase()}`, 403);
    }

    req.user = user;
    req.centerId = user.centerId || decoded.centerId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Session expired. Please log in again.', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token', 401);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.status === 'ACTIVE') {
        req.user = user;
        req.centerId = user.centerId || decoded.centerId;
      }
    }
    next();
  } catch {
    next();
  }
};

authenticate.authenticate = authenticate;
authenticate.optionalAuth = optionalAuth;

module.exports = authenticate;
