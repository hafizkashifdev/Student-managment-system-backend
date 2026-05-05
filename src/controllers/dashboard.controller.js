import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import FeePayment from '../models/FeePayment.model.js';
import Notification from '../models/Notification.model.js';
import { getOrSet } from '../services/cache.service.js';
import { getFeeSummary } from '../services/fee.service.js';
import { getAttendanceSummary } from '../services/attendance.service.js';
import { getFeeDefaulters } from '../services/fee.service.js';
import { toMonthString } from '../utils/dateHelper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CACHE_TTL } from '../utils/constants.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await getOrSet(`dashboard:stats:${req.academyId}`, CACHE_TTL.DASHBOARD, async () => {
    const month = toMonthString(new Date());
    const [studentCount, teacherCount, feeSummary, attendanceSummary] = await Promise.all([
      Student.countDocuments({ academyId: req.academyId, status: 'active', isDeleted: false }),
      Teacher.countDocuments({ academyId: req.academyId, isActive: true, isDeleted: false }),
      getFeeSummary(req.academyId, month),
      getAttendanceSummary(req.academyId, month),
    ]);
    return { studentCount, teacherCount, feeSummary, attendanceSummary };
  });

  res.json(new ApiResponse(200, stats, 'Dashboard stats fetched'));
});

export const getRevenue = asyncHandler(async (req, res) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(toMonthString(d));
  }

  const revenue = await FeePayment.aggregate([
    { $match: { academyId: new (await import('mongoose')).default.Types.ObjectId(req.academyId), month: { $in: months } } },
    { $group: { _id: '$month', total: { $sum: '$netPaid' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json(new ApiResponse(200, revenue, 'Revenue data fetched'));
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const [recentPayments, recentEnrollments] = await Promise.all([
    FeePayment.find({ academyId: req.academyId })
      .populate('studentId', 'name studentId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Student.find({ academyId: req.academyId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name studentId classId createdAt')
      .populate('classId', 'name')
      .lean(),
  ]);

  res.json(new ApiResponse(200, { recentPayments, recentEnrollments }, 'Recent activity fetched'));
});

export const getAlerts = asyncHandler(async (req, res) => {
  const [defaulters, failedMessages] = await Promise.all([
    getFeeDefaulters(req.academyId, {}),
    Notification.countDocuments({ academyId: req.academyId, type: 'whatsapp', status: 'failed' }),
  ]);

  res.json(new ApiResponse(200, {
    defaultersCount: defaulters.length,
    defaulters: defaulters.slice(0, 5),
    failedWhatsAppMessages: failedMessages,
  }, 'Alerts fetched'));
});
