import { Router } from 'express';
import v1Router from './v1/index.js';

const router = Router();

router.use('/v1', v1Router);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'SMS Backend is running', version: '1.0.0', timestamp: new Date().toISOString() });
});

export default router;
