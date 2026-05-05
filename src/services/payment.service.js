import FeePayment from '../models/FeePayment.model.js';
import Student from '../models/Student.model.js';
import { generateReceiptNumber } from '../utils/receiptGenerator.js';
import { NotFoundError, ConflictError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { formatDate } from '../utils/dateHelper.js';

/**
 * Record a fee payment and trigger receipt generation.
 * @param {string} academyId
 * @param {string} collectedBy - User ID
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function recordPayment(academyId, collectedBy, data) {
  const { studentId, month, amount, discount = 0, lateFee = 0, paymentMethod, paidBy, notes } = data;

  const student = await Student.findOne({ _id: studentId, academyId, isDeleted: false })
    .populate('classId', 'name section')
    .lean();
  if (!student) throw new NotFoundError('Student');

  const existing = await FeePayment.findOne({ academyId, studentId, month });
  if (existing) throw new ConflictError(`Fee already paid for ${month}`);

  const netPaid = amount - discount + lateFee;
  const receiptNumber = await generateReceiptNumber(academyId);

  const payment = await FeePayment.create({
    academyId,
    studentId,
    month,
    amount,
    discount,
    lateFee,
    netPaid,
    paymentMethod,
    receiptNumber,
    paidBy,
    collectedBy,
    notes,
  });

  return { payment, student };
}

/**
 * List payments with filters and pagination.
 * @param {string} academyId
 * @param {object} query
 */
export async function listPayments(academyId, query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = { academyId };

  if (query.studentId) filter.studentId = query.studentId;
  if (query.month) filter.month = query.month;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const [payments, total] = await Promise.all([
    FeePayment.find(filter)
      .populate('studentId', 'name studentId classId')
      .populate('collectedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    FeePayment.countDocuments(filter),
  ]);

  return { payments, meta: buildPaginationMeta(total, page, limit) };
}

/**
 * Get a single payment by ID.
 * @param {string} academyId
 * @param {string} paymentId
 */
export async function getPaymentById(academyId, paymentId) {
  const payment = await FeePayment.findOne({ _id: paymentId, academyId })
    .populate('studentId', 'name studentId classId parent')
    .populate('collectedBy', 'name')
    .lean();
  if (!payment) throw new NotFoundError('Payment');
  return payment;
}
