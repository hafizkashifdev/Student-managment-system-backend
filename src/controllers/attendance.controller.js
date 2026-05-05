import * as attendanceService from '../services/attendance.service.js';
import { queueBulkWhatsApp } from '../services/notification.service.js';
import { absentAlertTemplate } from '../utils/urduMessages.js';
import { formatDate } from '../utils/dateHelper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const markAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.markAttendance(req.academyId, req.user._id.toString(), req.body);
  res.status(201).json(new ApiResponse(201, record, 'Attendance marked'));
});

export const getTodayAttendance = asyncHandler(async (req, res) => {
  const records = await attendanceService.getTodayAttendance(req.academyId);
  res.json(new ApiResponse(200, records, 'Today attendance fetched'));
});

export const getClassAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getClassAttendance(req.academyId, req.params.classId, req.query);
  res.json(new ApiResponse(200, result.records, 'Class attendance fetched', result.meta));
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getStudentAttendance(req.academyId, req.params.id, req.query);
  res.json(new ApiResponse(200, result, 'Student attendance fetched'));
});

export const notifyAbsent = asyncHandler(async (req, res) => {
  const { date, classId } = req.body;
  const targetDate = date ? new Date(date) : new Date();

  const absentStudents = await attendanceService.getAbsentStudents(req.academyId, classId, targetDate);

  const messages = absentStudents
    .filter((s) => s.parent?.primaryWhatsapp)
    .map((s) => ({
      to: s.parent.primaryWhatsapp,
      body: absentAlertTemplate({
        academyName: req.academy.name,
        studentName: s.name,
        date: formatDate(targetDate),
        academyWhatsapp: req.academy.whatsappNumber || '',
      }),
      meta: { academyId: req.academyId, subType: 'absent_alert', relatedId: s._id, relatedModel: 'Student' },
    }));

  await queueBulkWhatsApp(messages);

  res.json(new ApiResponse(200, { notified: messages.length }, `${messages.length} absent notifications queued`));
});

export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const month = req.query.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const summary = await attendanceService.getAttendanceSummary(req.academyId, month);
  res.json(new ApiResponse(200, summary, 'Attendance summary fetched'));
});
