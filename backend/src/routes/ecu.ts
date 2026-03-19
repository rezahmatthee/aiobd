import { Router } from 'express';
import {
  startECUSession,
  endECUSession,
  readFirmware,
  writeFirmware,
  getECUInfo,
  applyTuning,
} from '../controllers/ecu';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post('/session', asyncHandler(startECUSession));
router.delete('/session/:id', asyncHandler(endECUSession));
router.get('/session/:id/firmware', authorize(UserRole.ADMIN, UserRole.TECHNICIAN), asyncHandler(readFirmware));
router.post('/session/:id/firmware', authorize(UserRole.ADMIN), asyncHandler(writeFirmware));
router.get('/session/:id/info', asyncHandler(getECUInfo));
router.post('/session/:id/tuning', authorize(UserRole.ADMIN, UserRole.TECHNICIAN), asyncHandler(applyTuning));

export default router;
