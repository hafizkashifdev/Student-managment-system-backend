import { Router } from 'express';
import authRoutes from './auth.routes.js';
import academyRoutes from './academy.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import attendanceRoutes from './attendance.routes.js';
import feeRoutes from './fee.routes.js';
import paymentRoutes from './payment.routes.js';
import whatsappRoutes from './whatsapp.routes.js';
import reportRoutes from './report.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import subscriptionRoutes from './subscription.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/academy', academyRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees', feeRoutes);
router.use('/payments', paymentRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/subscription', subscriptionRoutes);

export default router;
