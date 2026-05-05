import { Router } from 'express';
import * as teacherController from '../../controllers/teacher.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { auditLog } from '../../middleware/audit.middleware.js';
import { createTeacherSchema, updateTeacherSchema, salaryPaymentSchema } from '../../validators/teacher.validator.js';
import { PERMISSIONS } from '../../utils/constants.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.get('/', authorize(PERMISSIONS.TEACHER_READ), teacherController.listTeachers);
router.post('/', authorize(PERMISSIONS.TEACHER_WRITE), validate(createTeacherSchema), auditLog('Teacher', 'CREATE'), teacherController.createTeacher);
router.get('/:id', authorize(PERMISSIONS.TEACHER_READ), teacherController.getTeacher);
router.patch('/:id', authorize(PERMISSIONS.TEACHER_WRITE), validate(updateTeacherSchema), auditLog('Teacher', 'UPDATE'), teacherController.updateTeacher);
router.post('/:id/salary', authorize(PERMISSIONS.PAYMENT_WRITE), validate(salaryPaymentSchema), teacherController.paySalary);

export default router;
