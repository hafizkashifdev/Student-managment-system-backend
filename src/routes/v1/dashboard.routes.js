import { Router } from 'express';
import * as dashboardController from '../../controllers/dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.get('/stats', dashboardController.getStats);
router.get('/revenue', dashboardController.getRevenue);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/alerts', dashboardController.getAlerts);

export default router;
