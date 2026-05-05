import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    permissions: [{ type: String }],
    whatsappNumber: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ academyId: 1, email: 1 }, { unique: true });
userSchema.index({ academyId: 1, role: 1 });
userSchema.index({ academyId: 1, isActive: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const { env } = await import('../config/environment.js');
  this.password = await bcrypt.hash(this.password, env.BCRYPT_ROUNDS);
  next();
});

/**
 * Compare plain password with stored hash.
 * @param {string} candidate
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/**
 * Remove expired refresh tokens in-place.
 */
userSchema.methods.pruneExpiredTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((t) => t.expiresAt > now);
};

const User = mongoose.model('User', userSchema);
export default User;
