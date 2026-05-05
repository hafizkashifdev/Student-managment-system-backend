import Student from '../models/Student.model.js';
import Subscription from '../models/Subscription.model.js';
import { generateStudentId, generateAdmissionNumber } from '../utils/receiptGenerator.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError, NotFoundError } from '../utils/ApiError.js';
import { STUDENT_STATUS } from '../utils/constants.js';

/**
 * Create a new student after checking subscription limits.
 * @param {string} academyId
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createStudent(academyId, data) {
  const subscription = await Subscription.findOne({ academyId }).lean();
  const limit = subscription?.studentLimit ?? 50;

  const currentCount = await Student.countDocuments({ academyId, status: STUDENT_STATUS.ACTIVE, isDeleted: false });
  if (currentCount >= limit) {
    throw new ApiError(403, `Student limit reached (${limit}). Upgrade your subscription.`);
  }

  const [studentId, admissionNumber] = await Promise.all([
    generateStudentId(academyId),
    generateAdmissionNumber(academyId),
  ]);

  if (data.fee?.planId && data.fee.monthlyAmount > 0) {
    data.fee.netAmount = computeNetFee(data.fee.monthlyAmount, data.fee.discount);
  }

  const student = await Student.create({
    ...data,
    academyId,
    studentId,
    admission: { ...data.admission, number: admissionNumber },
  });

  return student;
}

/**
 * List students with pagination, search, and filters.
 * @param {string} academyId
 * @param {object} query
 * @returns {Promise<{ students: object[], meta: object }>}
 */
export async function listStudents(academyId, query) {
  const { page, limit, skip, sort } = parsePagination(query);

  const filter = { academyId, isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.classId) filter.classId = query.classId;
  if (query.gender) filter.gender = query.gender;
  if (query.search) filter.$text = { $search: query.search };

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('classId', 'name section')
      .populate('fee.planId', 'name amount')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  return { students, meta: buildPaginationMeta(total, page, limit) };
}

/**
 * Get a single student by ID, scoped to academy.
 * @param {string} academyId
 * @param {string} studentId
 * @returns {Promise<object>}
 */
export async function getStudentById(academyId, studentId) {
  const student = await Student.findOne({ _id: studentId, academyId, isDeleted: false })
    .populate('classId', 'name section grade')
    .populate('fee.planId', 'name amount dueDay lateFee')
    .lean();

  if (!student) throw new NotFoundError('Student');
  return student;
}

/**
 * Update a student, recomputing net fee if fee info changes.
 * @param {string} academyId
 * @param {string} studentId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateStudent(academyId, studentId, updates) {
  const student = await Student.findOne({ _id: studentId, academyId, isDeleted: false });
  if (!student) throw new NotFoundError('Student');

  if (updates.fee?.monthlyAmount || updates.fee?.discount) {
    const amount = updates.fee.monthlyAmount ?? student.fee.monthlyAmount;
    const discount = updates.fee.discount ?? student.fee.discount;
    updates.fee.netAmount = computeNetFee(amount, discount);
  }

  Object.assign(student, updates);
  await student.save();
  return student;
}

/**
 * Soft-delete a student.
 * @param {string} academyId
 * @param {string} studentId
 */
export async function deleteStudent(academyId, studentId) {
  const student = await Student.findOne({ _id: studentId, academyId, isDeleted: false });
  if (!student) throw new NotFoundError('Student');
  student.isDeleted = true;
  student.status = STUDENT_STATUS.INACTIVE;
  await student.save();
}

/**
 * Calculate net fee after applying discount.
 * @param {number} amount
 * @param {{ type: string, value: number }} discount
 * @returns {number}
 */
function computeNetFee(amount, discount) {
  if (!discount || !discount.value) return amount;
  if (discount.type === 'percent') return amount - (amount * discount.value) / 100;
  return Math.max(0, amount - discount.value);
}
