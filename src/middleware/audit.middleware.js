import AuditLog from '../models/AuditLog.model.js';
import { logger } from '../config/logger.js';

/**
 * Automatically log mutating requests to the AuditLog collection.
 * Attaches after-response hook so it does not block the response.
 * @param {string} resource - Model/resource name
 * @param {string} action - CREATE | UPDATE | DELETE
 */
export function auditLog(resource, action) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      if (res.statusCode < 400 && req.academyId && req.user) {
        AuditLog.create({
          academyId: req.academyId,
          userId: req.user._id,
          action,
          resource,
          resourceId: req.params?.id || body?.data?._id,
          newValue: action !== 'DELETE' ? body?.data : undefined,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          description: `${action} ${resource} by ${req.user.name}`,
        }).catch((err) => logger.error(`Audit log failed: ${err.message}`));
      }
      return originalJson(body);
    };

    next();
  };
}
