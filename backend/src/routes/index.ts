import { Router } from 'express';
import authRoutes from './auth';
import vehicleRoutes from './vehicles';
import diagnosticRoutes from './diagnostics';
import ecuRoutes from './ecu';
import controlRoutes from './controls';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/diagnostics', diagnosticRoutes);
router.use('/ecu', ecuRoutes);
router.use('/controls', controlRoutes);

export default router;
