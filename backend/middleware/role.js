/**
 * Role Middleware - Check user roles
 */

/**
 * Check if user has required role(s)
 * @param {string[]} roles - Array of allowed roles
 */
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Role definitions for easy reference
 */
exports.ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
};

/**
 * Permission levels (higher number = more permissions)
 */
exports.PERMISSIONS = {
  admin: 3,
  manager: 2,
  staff: 1
};

/**
 * Check if user has minimum role level
 * @param {string} minRole - Minimum required role
 */
exports.checkMinRole = (minRole) => {
  const roleLevels = {
    staff: 1,
    manager: 2,
    admin: 3
  };
  
  const minLevel = roleLevels[minRole];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userLevel = roleLevels[req.user.role];
    
    if (userLevel < minLevel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};
