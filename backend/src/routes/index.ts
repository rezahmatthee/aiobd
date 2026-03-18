import { Router } from 'express';
import authRoutes from './auth';
import vehicleRoutes from './vehicles';
import diagnosticRoutes from './diagnostics';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/diagnostics', diagnosticRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
