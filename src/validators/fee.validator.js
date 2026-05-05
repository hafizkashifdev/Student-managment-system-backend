import { z } from 'zod';

export const createFeePlanSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    amount: z.number().min(0),
    frequency: z.enum(['monthly', 'quarterly', 'annually']).optional(),
    dueDay: z.number().min(1).max(28).optional(),
    description: z.string().max(500).optional(),
    lateFee: z
      .object({
        amount: z.number().min(0),
        gracePeriodDays: z.number().min(0),
      })
      .optional(),
  }),
});

export const updateFeePlanSchema = z.object({
  body: createFeePlanSchema.shape.body.partial(),
  params: z.object({ id: z.string().min(24).max(24) }),
});

export const feeQuerySchema = z.object({
  query: z.object({
    classId: z.string().optional(),
    month: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const sendFeeReminderSchema = z.object({
  body: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM'),
    classId: z.string().optional(),
    studentIds: z.array(z.string()).optional(),
  }),
});
