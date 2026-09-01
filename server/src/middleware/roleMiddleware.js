const ApiResponse = require('../utils/apiResponse');

/**
 * Role-based access control middleware
 * Can be called as requireRole('ADMIN', 'CSC') or requireRole(['ADMIN', 'CSC'])
 */
const requireRole = (...roles) => {
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Requires one of: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

requireRole.requireRole = requireRole;

module.exports = requireRole;
