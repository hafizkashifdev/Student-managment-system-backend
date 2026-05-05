import { z } from 'zod';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

const attendanceRecordSchema = z.object({
  studentId: z.string().min(24).max(24),
  status: z.enum(Object.values(ATTENDANCE_STATUS)),
  arrivalTime: z.string().optional(),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    classId: z.string().min(24).max(24),
    date: z.string().optional(),
    records: z.array(attendanceRecordSchema).min(1),
  }),
});

export const attendanceQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    classId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const notifyAbsentSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    classId: z.string().min(24).max(24).optional(),
  }),
});
