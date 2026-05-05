import { Router } from 'express';
import * as paymentController from '../../controllers/payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { auditLog } from '../../middleware/audit.middleware.js';
import { recordPaymentSchema, paymentQuerySchema } from '../../validators/payment.validator.js';
import { PERMISSIONS } from '../../utils/constants.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.post('/', authorize(PERMISSIONS.PAYMENT_WRITE), validate(recordPaymentSchema), auditLog('FeePayment', 'CREATE'), paymentController.recordPayment);
router.get('/', authorize(PERMISSIONS.PAYMENT_READ), validate(paymentQuerySchema), paymentController.listPayments);
router.get('/:id', authorize(PERMISSIONS.PAYMENT_READ), paymentController.getPayment);
router.get('/:id/receipt', authorize(PERMISSIONS.PAYMENT_READ), paymentController.downloadReceipt);

export default router;
