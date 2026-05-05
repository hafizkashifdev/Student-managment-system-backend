import { z } from 'zod';
import { PAYMENT_METHODS } from '../utils/constants.js';

export const recordPaymentSchema = z.object({
  body: z.object({
    studentId: z.string().min(24).max(24),
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM'),
    amount: z.number().min(0),
    discount: z.number().min(0).optional(),
    lateFee: z.number().min(0).optional(),
    paymentMethod: z.enum(Object.values(PAYMENT_METHODS)).optional(),
    paidBy: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const paymentQuerySchema = z.object({
  query: z.object({
    studentId: z.string().optional(),
    month: z.string().optional(),
    paymentMethod: z.enum(Object.values(PAYMENT_METHODS)).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
