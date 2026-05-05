import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import User from '../models/User.model.js';
import { UnauthorizedError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verify JWT access token and attach user + academy to req.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const user = await User.findById(decoded.userId)
    .select('-password -refreshTokens -passwordResetToken -passwordResetExpiry')
    .lean();

  if (!user || !user.isActive || user.isDeleted) {
    throw new UnauthorizedError('User not found or inactive');
  }

  req.user = user;
  req.academyId = user.academyId.toString();
  next();
});
