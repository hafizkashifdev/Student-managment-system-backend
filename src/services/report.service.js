import Student from '../models/Student.model.js';
import FeePayment from '../models/FeePayment.model.js';
import Attendance from '../models/Attendance.model.js';
import Teacher from '../models/Teacher.model.js';
import { getMonthRange, toMonthString } from '../utils/dateHelper.js';
import { generateAndUploadPDF, renderTemplate } from './pdf.service.js';

/**
 * Generate a monthly academy report PDF and return the URL.
 * @param {string} academyId
 * @param {object} academy
 * @param {string} month - YYYY-MM
 * @returns {Promise<{ url: string, stats: object }>}
 */
export async function generateMonthlyReport(academyId, academy, month) {
  const { start, end } = getMonthRange(month);

  const [studentCount, paymentStats, attendanceStats, teacherCount] = await Promise.all([
    Student.countDocuments({ academyId, status: 'active', isDeleted: false }),
    FeePayment.aggregate([
      { $match: { academyId: academy._id, month } },
      { $group: { _id: null, total: { $sum: '$netPaid' }, count: { $sum: 1 } } },
    ]),
    Attendance.aggregate([
      { $match: { academyId: academy._id, date: { $gte: start, $lte: end } } },
      { $unwind: '$records' },
      { $group: { _id: '$records.status', count: { $sum: 1 } } },
    ]),
    Teacher.countDocuments({ academyId, isActive: true, isDeleted: false }),
  ]);

  const fees = paymentStats[0] || { total: 0, count: 0 };
  const attendance = attendanceStats.reduce((a, s) => ({ ...a, [s._id]: s.count }), {});

  const stats = { month, studentCount, teacherCount, fees, attendance };

  const html = renderTemplate('monthly-report.html', {
    academyName: academy.name,
    month,
    studentCount,
    teacherCount,
    totalCollected: fees.total.toLocaleString(),
    paymentCount: fees.count,
    present: attendance.present || 0,
    absent: attendance.absent || 0,
    late: attendance.late || 0,
    generatedAt: new Date().toLocaleDateString(),
  });

  const url = await generateAndUploadPDF(html, `reports/monthly-${academyId}-${month}`);
  return { url, stats };
}
