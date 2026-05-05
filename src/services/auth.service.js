import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/environment.js';
import User from '../models/User.model.js';
import Academy from '../models/Academy.model.js';
import Subscription from '../models/Subscription.model.js';
import { ApiError, UnauthorizedError, NotFoundError, ConflictError } from '../utils/ApiError.js';
import { ROLES, SUBSCRIPTION_PLANS } from '../utils/constants.js';

/**
 * Generate access + refresh JWT tokens for a user.
 * @param {object} user
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateTokens(user) {
  const payload = { userId: user._id.toString(), academyId: user.academyId.toString(), role: user.role };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ userId: user._id.toString() }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });

  return { accessToken, refreshToken };
}

/**
 * Register a new academy and its admin user.
 * @param {object} data
 * @returns {{ academy: object, user: object, tokens: object }}
 */
export async function registerAcademy(data) {
  const { academyName, academyEmail, ownerName, whatsappNumber, city, adminName, adminEmail, password } = data;

  const existingAcademy = await Academy.findOne({ email: academyEmail }).lean();
  if (existingAcademy) throw new ConflictError('Academy email already registered');

  const academy = await Academy.create({
    name: academyName,
    email: academyEmail,
    ownerName,
    whatsappNumber,
    address: { city },
  });

  await Subscription.create({
    academyId: academy._id,
    plan: SUBSCRIPTION_PLANS.FREE,
    studentLimit: env.ACADEMY_STUDENT_LIMITS[SUBSCRIPTION_PLANS.FREE],
  });

  const user = await User.create({
    academyId: academy._id,
    name: adminName,
    email: adminEmail,
    password,
    role: ROLES.ADMIN,
  });

  const tokens = generateTokens(user);
  await saveRefreshToken(user._id, tokens.refreshToken);

  const userObj = user.toObject();
  delete userObj.password;

  return { academy, user: userObj, tokens };
}

/**
 * Authenticate user credentials and return tokens.
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object, tokens: object }}
 */
export async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true, isDeleted: false }).select('+password');
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError('Invalid email or password');

  user.lastLogin = new Date();
  user.pruneExpiredTokens();

  const tokens = generateTokens(user);
  await saveRefreshToken(user._id, tokens.refreshToken);
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshTokens;

  return { user: userObj, tokens };
}

/**
 * Refresh access token using a valid refresh token.
 * @param {string} refreshToken
 * @returns {{ accessToken: string }}
 */
export async function refreshAccessToken(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw new UnauthorizedError('User not found');

  const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken && t.expiresAt > new Date());
  if (!tokenExists) throw new UnauthorizedError('Refresh token expired or revoked');

  const { accessToken } = generateTokens(user);
  return { accessToken };
}

/**
 * Invalidate a refresh token on logout.
 * @param {string} userId
 * @param {string} refreshToken
 */
export async function logoutUser(userId, refreshToken) {
  await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: { token: refreshToken } } });
}

/**
 * Generate a password reset token and store it hashed.
 * @param {string} email
 * @returns {string} raw token (to be emailed)
 */
export async function createPasswordResetToken(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new NotFoundError('User');

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  return rawToken;
}

/**
 * Reset password using the raw token from email.
 * @param {string} rawToken
 * @param {string} newPassword
 */
export async function resetPassword(rawToken, newPassword) {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpiry: { $gt: new Date() } });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshTokens = [];
  await user.save();
}

/**
 * Store hashed refresh token with expiry in user document.
 * @param {string} userId
 * @param {string} token
 */
async function saveRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await User.findByIdAndUpdate(userId, {
    $push: { refreshTokens: { token, expiresAt } },
  });
}
