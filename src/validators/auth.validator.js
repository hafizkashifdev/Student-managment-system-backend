import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    academyName: z.string().min(2).max(100),
    academyEmail: z.string().email(),
    ownerName: z.string().min(2).max(100),
    whatsappNumber: z.string().min(10).max(20),
    city: z.string().optional(),
    adminName: z.string().min(2).max(100),
    adminEmail: z.string().email(),
    password: z.string().min(8).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(100),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
  }),
});
