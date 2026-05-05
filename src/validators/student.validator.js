import { z } from 'zod';

const parentSchema = z.object({
  fatherName: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
  primaryWhatsapp: z.string().min(10).max(20),
  secondaryWhatsapp: z.string().min(10).max(20).optional(),
  email: z.string().email().optional(),
  cnic: z.string().max(20).optional(),
  occupation: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
});

const feeSchema = z.object({
  planId: z.string().optional(),
  monthlyAmount: z.number().min(0).optional(),
  discount: z
    .object({
      type: z.enum(['percent', 'fixed']),
      value: z.number().min(0),
    })
    .optional(),
}).optional();

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female']),
    classId: z.string().optional(),
    rollNumber: z.string().max(20).optional(),
    parent: parentSchema,
    admission: z
      .object({
        date: z.string().optional(),
        previousSchool: z.string().max(200).optional(),
      })
      .optional(),
    fee: feeSchema,
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female']).optional(),
    classId: z.string().optional(),
    rollNumber: z.string().max(20).optional(),
    status: z.enum(['active', 'inactive', 'graduated', 'transferred']).optional(),
    parent: parentSchema.partial().optional(),
    fee: feeSchema,
  }),
  params: z.object({ id: z.string().min(24).max(24) }),
});

export const studentQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    classId: z.string().optional(),
    status: z.enum(['active', 'inactive', 'graduated', 'transferred']).optional(),
    gender: z.enum(['male', 'female']).optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
