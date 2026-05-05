import { z } from 'zod';

export const createTeacherSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().optional(),
    whatsappNumber: z.string().min(10).max(20).optional(),
    cnic: z.string().max(20).optional(),
    subjects: z.array(z.string()).optional(),
    classes: z.array(z.string()).optional(),
    qualification: z.string().max(200).optional(),
    experience: z.number().min(0).optional(),
    joiningDate: z.string().optional(),
    salary: z
      .object({
        amount: z.number().min(0),
        payDay: z.number().min(1).max(31).optional(),
        bankAccount: z.string().optional(),
        bankName: z.string().optional(),
      })
      .optional(),
  }),
});

export const updateTeacherSchema = z.object({
  body: createTeacherSchema.shape.body.partial(),
  params: z.object({ id: z.string().min(24).max(24) }),
});

export const salaryPaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(0),
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM'),
    paymentMethod: z.enum(['cash', 'bank', 'easypaisa', 'jazzcash']).optional(),
    notes: z.string().max(500).optional(),
  }),
  params: z.object({ id: z.string().min(24).max(24) }),
});
