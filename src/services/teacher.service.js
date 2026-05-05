import Teacher from '../models/Teacher.model.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { NotFoundError } from '../utils/ApiError.js';

/**
 * @param {string} academyId
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createTeacher(academyId, data) {
  return Teacher.create({ ...data, academyId });
}

/**
 * @param {string} academyId
 * @param {object} query
 * @returns {Promise<{ teachers: object[], meta: object }>}
 */
export async function listTeachers(academyId, query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = { academyId, isDeleted: false };
  if (query.search) filter.$text = { $search: query.search };

  const [teachers, total] = await Promise.all([
    Teacher.find(filter).populate('classes', 'name section').sort(sort).skip(skip).limit(limit).lean(),
    Teacher.countDocuments(filter),
  ]);

  return { teachers, meta: buildPaginationMeta(total, page, limit) };
}

/**
 * @param {string} academyId
 * @param {string} teacherId
 * @returns {Promise<object>}
 */
export async function getTeacherById(academyId, teacherId) {
  const teacher = await Teacher.findOne({ _id: teacherId, academyId, isDeleted: false })
    .populate('classes', 'name section')
    .lean();
  if (!teacher) throw new NotFoundError('Teacher');
  return teacher;
}

/**
 * @param {string} academyId
 * @param {string} teacherId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateTeacher(academyId, teacherId, updates) {
  const teacher = await Teacher.findOneAndUpdate(
    { _id: teacherId, academyId, isDeleted: false },
    updates,
    { new: true, runValidators: true }
  ).lean();
  if (!teacher) throw new NotFoundError('Teacher');
  return teacher;
}

/**
 * Soft delete a teacher.
 * @param {string} academyId
 * @param {string} teacherId
 */
export async function deleteTeacher(academyId, teacherId) {
  const teacher = await Teacher.findOne({ _id: teacherId, academyId, isDeleted: false });
  if (!teacher) throw new NotFoundError('Teacher');
  teacher.isDeleted = true;
  teacher.isActive = false;
  await teacher.save();
}
