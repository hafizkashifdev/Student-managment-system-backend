import { Router } from 'express';
import multer from 'multer';
import * as studentController from '../../controllers/student.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { cacheResponse } from '../../middleware/cache.middleware.js';
import { auditLog } from '../../middleware/audit.middleware.js';
import { createStudentSchema, updateStudentSchema, studentQuerySchema } from '../../validators/student.validator.js';
import { PERMISSIONS } from '../../utils/constants.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate, resolveTenant);

router.get('/', authorize(PERMISSIONS.STUDENT_READ), validate(studentQuerySchema), cacheResponse(120), studentController.listStudents);
router.post('/', authorize(PERMISSIONS.STUDENT_WRITE), validate(createStudentSchema), auditLog('Student', 'CREATE'), studentController.createStudent);
router.get('/:id', authorize(PERMISSIONS.STUDENT_READ), studentController.getStudent);
router.patch('/:id', authorize(PERMISSIONS.STUDENT_WRITE), validate(updateStudentSchema), auditLog('Student', 'UPDATE'), studentController.updateStudent);
router.delete('/:id', authorize(PERMISSIONS.STUDENT_DELETE), auditLog('Student', 'DELETE'), studentController.deleteStudent);
router.get('/:id/attendance', authorize(PERMISSIONS.ATTENDANCE_READ), studentController.getStudentAttendance);
router.get('/:id/fees', authorize(PERMISSIONS.FEE_READ), studentController.getStudentFees);
router.post('/:id/photo', authorize(PERMISSIONS.STUDENT_WRITE), upload.single('photo'), studentController.uploadStudentPhoto);

export default router;
