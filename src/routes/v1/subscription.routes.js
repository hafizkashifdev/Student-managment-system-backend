import { Router } from 'express';
import * as subscriptionController from '../../controllers/subscription.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.get('/', subscriptionController.getSubscription);
router.post('/upgrade', requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), subscriptionController.updateSubscription);

export default router;
