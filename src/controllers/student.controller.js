import * as studentService from '../services/student.service.js';
import * as attendanceService from '../services/attendance.service.js';
import { listPayments } from '../services/payment.service.js';
import { cloudinary } from '../config/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import streamifier from 'streamifier';

export const listStudents = asyncHandler(async (req, res) => {
  const { students, meta } = await studentService.listStudents(req.academyId, req.query);
  res.json(new ApiResponse(200, students, 'Students fetched', meta));
});

export const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.academyId, req.body);
  res.status(201).json(new ApiResponse(201, student, 'Student created'));
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.academyId, req.params.id);
  res.json(new ApiResponse(200, student, 'Student fetched'));
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.academyId, req.params.id, req.body);
  res.json(new ApiResponse(200, student, 'Student updated'));
});

export const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.academyId, req.params.id);
  res.json(new ApiResponse(200, null, 'Student deleted'));
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getStudentAttendance(req.academyId, req.params.id, req.query);
  res.json(new ApiResponse(200, result, 'Attendance fetched'));
});

export const getStudentFees = asyncHandler(async (req, res) => {
  const { payments, meta } = await listPayments(req.academyId, { ...req.query, studentId: req.params.id });
  res.json(new ApiResponse(200, payments, 'Fee history fetched', meta));
});

export const uploadStudentPhoto = asyncHandler(async (req, res) => {
  const { ApiError, NotFoundError } = await import('../utils/ApiError.js');
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const student = await studentService.getStudentById(req.academyId, req.params.id);

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `sms/students/${req.academyId}`, public_id: req.params.id, overwrite: true },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  await studentService.updateStudent(req.academyId, req.params.id, { photo: uploadResult.secure_url });
  res.json(new ApiResponse(200, { photo: uploadResult.secure_url }, 'Photo uploaded'));
});
