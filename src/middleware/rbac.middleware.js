import { ROLE_PERMISSIONS } from '../utils/constants.js';
import { ForbiddenError } from '../utils/ApiError.js';

/**
 * Check if the authenticated user has a required permission.
 * Admins and super_admins bypass all checks.
 * @param {string} requiredPermission
 * @returns {Function} Express middleware
 */
export function authorize(requiredPermission) {
  return (req, res, next) => {
    const { user } = req;
    if (!user) return next(new ForbiddenError());

    const rolePerms = ROLE_PERMISSIONS[user.role] || [];

    const hasWildcard = rolePerms.includes('*');
    const hasPermission =
      hasWildcard ||
      rolePerms.includes(requiredPermission) ||
      (user.permissions || []).includes(requiredPermission) ||
      (user.permissions || []).includes('*');

    if (!hasPermission) {
      return next(new ForbiddenError(`Permission required: ${requiredPermission}`));
    }
    next();
  };
}

/**
 * Require one of multiple roles.
 * @param {...string} roles
 * @returns {Function}
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient role'));
    }
    next();
  };
}
