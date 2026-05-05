import * as authService from '../services/auth.service.js';
import * as emailService from '../services/email.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/environment.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerAcademy(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Academy registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(new ApiResponse(200, result, 'Login successful'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  res.json(new ApiResponse(200, result, 'Token refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logoutUser(req.user._id.toString(), refreshToken);
  res.json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const rawToken = await authService.createPasswordResetToken(email);
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await emailService.sendPasswordResetEmail(email, resetUrl, 'User');
  res.json(new ApiResponse(200, null, 'Password reset email sent'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res.json(new ApiResponse(200, null, 'Password reset successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user, 'Profile fetched'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await (await import('../models/User.model.js')).default
    .findById(req.user._id)
    .select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const { ApiError } = await import('../utils/ApiError.js');
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});
