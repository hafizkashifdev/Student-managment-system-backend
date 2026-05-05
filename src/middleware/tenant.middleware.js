import Academy from '../models/Academy.model.js';
import { UnauthorizedError, NotFoundError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Resolve the academy from the authenticated user and validate it is active.
 * Attaches req.academy for downstream use.
 */
export const resolveTenant = asyncHandler(async (req, res, next) => {
  if (!req.academyId) throw new UnauthorizedError('No academy context');

  const academy = await Academy.findById(req.academyId).lean();
  if (!academy || !academy.isActive) {
    throw new NotFoundError('Academy');
  }

  req.academy = academy;
  next();
});
