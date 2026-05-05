import FeePlan from '../models/Fee.model.js';
import Student from '../models/Student.model.js';
import FeePayment from '../models/FeePayment.model.js';
import { NotFoundError, ConflictError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { toMonthString } from '../utils/dateHelper.js';

/**
 * @param {string} academyId
 * @param {object} data
 */
export async function createFeePlan(academyId, data) {
  return FeePlan.create({ ...data, academyId });
}

/**
 * @param {string} academyId
 * @returns {Promise<object[]>}
 */
export async function listFeePlans(academyId) {
  return FeePlan.find({ academyId, isActive: true }).lean();
}

/**
 * @param {string} academyId
 * @param {string} planId
 * @param {object} updates
 */
export async function updateFeePlan(academyId, planId, updates) {
  const plan = await FeePlan.findOneAndUpdate({ _id: planId, academyId }, updates, { new: true }).lean();
  if (!plan) throw new NotFoundError('Fee plan');
  return plan;
}

/**
 * List students with unpaid fees for a given month.
 * @param {string} academyId
 * @param {object} query
 */
export async function getPendingFees(academyId, query) {
  const month = query.month || toMonthString(new Date());
  const { page, limit, skip } = parsePagination(query);

  const paidStudentIds = await FeePayment.distinct('studentId', { academyId, month });

  const filter = { academyId, isDeleted: false, status: 'active', _id: { $nin: paidStudentIds } };
  if (query.classId) filter.classId = query.classId;

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('classId', 'name section')
      .select('name studentId classId fee parent')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  return { students, month, meta: buildPaginationMeta(total, page, limit) };
}

/**
 * Get monthly fee collection summary.
 * @param {string} academyId
 * @param {string} month - YYYY-MM
 */
export async function getFeeSummary(academyId, month) {
  const currentMonth = month || toMonthString(new Date());

  const [payments, totalStudents, paidCount] = await Promise.all([
    FeePayment.aggregate([
      { $match: { academyId: new (await import('mongoose')).default.Types.ObjectId(academyId), month: currentMonth } },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$netPaid' },
          totalDiscount: { $sum: '$discount' },
          totalLateFee: { $sum: '$lateFee' },
          count: { $sum: 1 },
        },
      },
    ]),
    Student.countDocuments({ academyId, status: 'active', isDeleted: false }),
    FeePayment.countDocuments({ academyId, month: currentMonth }),
  ]);

  const summary = payments[0] || { totalCollected: 0, totalDiscount: 0, totalLateFee: 0, count: 0 };

  return {
    month: currentMonth,
    ...summary,
    totalStudents,
    paidCount,
    pendingCount: totalStudents - paidCount,
    collectionRate: totalStudents ? ((paidCount / totalStudents) * 100).toFixed(1) : 0,
  };
}

/**
 * Get students with overdue fees (defaulters).
 * @param {string} academyId
 * @param {object} query
 */
export async function getFeeDefaulters(academyId, query) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(toMonthString(d));
  }

  const paidSet = await FeePayment.find({ academyId, month: { $in: months } })
    .distinct('studentId');

  const defaulters = await Student.find({
    academyId,
    isDeleted: false,
    status: 'active',
    _id: { $nin: paidSet },
    'fee.monthlyAmount': { $gt: 0 },
  })
    .populate('classId', 'name section')
    .select('name studentId classId fee parent')
    .lean();

  return defaulters;
}
