import { Router } from 'express';
import * as whatsappController from '../../controllers/whatsapp.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { whatsappRateLimit } from '../../middleware/rateLimit.middleware.js';
import { PERMISSIONS } from '../../utils/constants.js';

const router = Router();
router.use(authenticate, resolveTenant);

router.post('/send', authorize(PERMISSIONS.WHATSAPP_SEND), whatsappRateLimit, whatsappController.sendSingle);
router.post('/bulk', authorize(PERMISSIONS.WHATSAPP_SEND), whatsappRateLimit, whatsappController.sendBulk);
router.get('/logs', authorize(PERMISSIONS.WHATSAPP_SEND), whatsappController.getLogs);
router.get('/stats', authorize(PERMISSIONS.WHATSAPP_SEND), whatsappController.getStats);
router.get('/test', authenticate, whatsappController.testConnection);

export default router;
