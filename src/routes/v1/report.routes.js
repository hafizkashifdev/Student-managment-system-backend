import { Router } from 'express';
import * as reportController from '../../controllers/report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { reportRateLimit } from '../../middleware/rateLimit.middleware.js';
import { PERMISSIONS } from '../../utils/constants.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.get('/monthly', authorize(PERMISSIONS.REPORT_READ), reportRateLimit, reportController.getMonthlyReport);
router.get('/status/:jobId', authorize(PERMISSIONS.REPORT_READ), reportController.getReportJobStatus);
router.get('/fee-collection', authorize(PERMISSIONS.REPORT_READ), reportController.getFeeCollectionReport);

export default router;
