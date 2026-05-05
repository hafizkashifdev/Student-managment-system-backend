import { Router } from 'express';
import * as attendanceController from '../../controllers/attendance.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { markAttendanceSchema, attendanceQuerySchema, notifyAbsentSchema } from '../../validators/attendance.validator.js';
import { PERMISSIONS } from '../../utils/constants.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.post('/mark', authorize(PERMISSIONS.ATTENDANCE_MARK), validate(markAttendanceSchema), attendanceController.markAttendance);
router.get('/today', authorize(PERMISSIONS.ATTENDANCE_READ), attendanceController.getTodayAttendance);
router.get('/class/:classId', authorize(PERMISSIONS.ATTENDANCE_READ), validate(attendanceQuerySchema), attendanceController.getClassAttendance);
router.get('/student/:id', authorize(PERMISSIONS.ATTENDANCE_READ), attendanceController.getStudentAttendance);
router.post('/notify-absent', authorize(PERMISSIONS.WHATSAPP_SEND), validate(notifyAbsentSchema), attendanceController.notifyAbsent);
router.get('/summary', authorize(PERMISSIONS.ATTENDANCE_READ), attendanceController.getAttendanceSummary);

export default router;
