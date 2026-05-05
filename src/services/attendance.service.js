import Attendance from '../models/Attendance.model.js';
import Student from '../models/Student.model.js';
import { ApiError, NotFoundError } from '../utils/ApiError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

/**
 * Mark or update attendance for a class on a given date.
 * @param {string} academyId
 * @param {string} markedBy - User ID
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function markAttendance(academyId, markedBy, data) {
  const { classId, records, date } = data;
  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  const enrichedRecords = records.map((r) => ({ ...r, markedBy }));

  const attendance = await Attendance.findOneAndUpdate(
    { academyId, classId, date: attendanceDate },
    { $set: { records: enrichedRecords, markedAt: new Date() } },
    { new: true, upsert: true, runValidators: true }
  );

  return attendance;
}

/**
 * Get today's attendance summary for all classes in the academy.
 * @param {string} academyId
 * @returns {Promise<object[]>}
 */
export async function getTodayAttendance(academyId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Attendance.find({ academyId, date: today })
    .populate('classId', 'name section')
    .lean();
}

/**
 * Get attendance for a specific class over a date range.
 * @param {string} academyId
 * @param {string} classId
 * @param {object} query
 * @returns {Promise<{ records: object[], meta: object }>}
 */
export async function getClassAttendance(academyId, classId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { academyId, classId };

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    Attendance.countDocuments(filter),
  ]);

  return { records, meta: buildPaginationMeta(total, page, limit) };
}

/**
 * Get attendance history for a single student.
 * @param {string} academyId
 * @param {string} studentId
 * @param {object} query
 * @returns {Promise<object>}
 */
export async function getStudentAttendance(academyId, studentId, query) {
  const filter = { academyId, 'records.studentId': studentId };

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  const records = await Attendance.find(filter).sort({ date: -1 }).lean();

  const studentRecords = records.map((a) => {
    const r = a.records.find((rec) => rec.studentId.toString() === studentId);
    return { date: a.date, classId: a.classId, ...r };
  });

  const summary = studentRecords.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0, present: 0, absent: 0, late: 0, leave: 0 }
  );

  return { records: studentRecords, summary };
}

/**
 * Get IDs of students absent today (for notification).
 * @param {string} academyId
 * @param {string} [classId]
 * @param {Date} [date]
 * @returns {Promise<object[]>}
 */
export async function getAbsentStudents(academyId, classId, date) {
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const filter = { academyId, date: targetDate };
  if (classId) filter.classId = classId;

  const attendances = await Attendance.find(filter).lean();

  const absentStudentIds = [];
  for (const att of attendances) {
    for (const rec of att.records) {
      if (rec.status === ATTENDANCE_STATUS.ABSENT) {
        absentStudentIds.push(rec.studentId);
      }
    }
  }

  return Student.find({ _id: { $in: absentStudentIds }, academyId, isDeleted: false })
    .select('name parent classId')
    .populate('classId', 'name section')
    .lean();
}

/**
 * Get monthly attendance summary for the academy.
 * @param {string} academyId
 * @param {string} month - YYYY-MM
 * @returns {Promise<object>}
 */
export async function getAttendanceSummary(academyId, month) {
  const [year, m] = month.split('-').map(Number);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 0, 23, 59, 59);

  const records = await Attendance.find({ academyId, date: { $gte: start, $lte: end } }).lean();

  let total = 0, present = 0, absent = 0, late = 0, leave = 0;
  for (const att of records) {
    for (const rec of att.records) {
      total++;
      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'late') late++;
      else if (rec.status === 'leave') leave++;
    }
  }

  return { month, total, present, absent, late, leave, attendanceRate: total ? ((present / total) * 100).toFixed(1) : 0 };
}
