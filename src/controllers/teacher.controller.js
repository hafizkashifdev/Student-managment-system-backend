import * as teacherService from '../services/teacher.service.js';
import { queueWhatsApp } from '../services/notification.service.js';
import { salarySlipTemplate } from '../utils/urduMessages.js';
import { formatDate, toMonthString } from '../utils/dateHelper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listTeachers = asyncHandler(async (req, res) => {
  const { teachers, meta } = await teacherService.listTeachers(req.academyId, req.query);
  res.json(new ApiResponse(200, teachers, 'Teachers fetched', meta));
});

export const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.createTeacher(req.academyId, req.body);
  res.status(201).json(new ApiResponse(201, teacher, 'Teacher created'));
});

export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getTeacherById(req.academyId, req.params.id);
  res.json(new ApiResponse(200, teacher, 'Teacher fetched'));
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.updateTeacher(req.academyId, req.params.id, req.body);
  res.json(new ApiResponse(200, teacher, 'Teacher updated'));
});

export const paySalary = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getTeacherById(req.academyId, req.params.id);
  const { amount, month, notes } = req.body;

  if (teacher.whatsappNumber) {
    const body = salarySlipTemplate({
      academyName: req.academy.name,
      teacherName: teacher.name,
      amount,
      month: month || toMonthString(new Date()),
      date: formatDate(new Date()),
      slipUrl: 'Slip will be shared shortly.',
    });

    await queueWhatsApp(teacher.whatsappNumber, body, {
      academyId: req.academyId,
      subType: 'salary_slip',
      relatedId: teacher._id,
      relatedModel: 'Teacher',
    });
  }

  res.json(new ApiResponse(200, { teacher: teacher._id, amount, month }, 'Salary processed'));
});
