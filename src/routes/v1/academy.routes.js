import { Router } from 'express';
import multer from 'multer';
import * as academyController from '../../controllers/academy.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.use(authenticate, resolveTenant);

router.get('/', academyController.getAcademy);
router.patch('/', requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), academyController.updateAcademy);
router.post('/logo', requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), upload.single('logo'), academyController.uploadLogo);

export default router;
