import { Router } from 'express';
import * as feeController from '../../controllers/fee.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createFeePlanSchema, updateFeePlanSchema, sendFeeReminderSchema } from '../../validators/fee.validator.js';
import { PERMISSIONS } from '../../utils/constants.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.get('/plans', authorize(PERMISSIONS.FEE_READ), feeController.listFeePlans);
router.post('/plans', authorize(PERMISSIONS.FEE_WRITE), validate(createFeePlanSchema), feeController.createFeePlan);
router.patch('/plans/:id', authorize(PERMISSIONS.FEE_WRITE), validate(updateFeePlanSchema), feeController.updateFeePlan);
router.get('/pending', authorize(PERMISSIONS.FEE_READ), feeController.getPendingFees);
router.get('/defaulters', authorize(PERMISSIONS.FEE_READ), feeController.getFeeDefaulters);
router.get('/summary', authorize(PERMISSIONS.FEE_READ), feeController.getFeeSummary);
router.post('/remind', authorize(PERMISSIONS.WHATSAPP_SEND), validate(sendFeeReminderSchema), feeController.sendFeeReminders);

export default router;
