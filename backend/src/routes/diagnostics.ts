import { Router } from 'express';
import {
  connect,
  getLiveData,
  readCodes,
  clearCodes,
  getFreezeFrame,
  disconnect,
} from '../controllers/diagnostics';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.use(authenticate);

router.post('/connect', asyncHandler(connect));
router.get('/:sessionId/live', getLiveData);
router.get('/:sessionId/codes', asyncHandler(readCodes));
router.delete('/:sessionId/codes', asyncHandler(clearCodes));
router.get('/:sessionId/freeze-frame', asyncHandler(getFreezeFrame));
router.delete('/:sessionId/disconnect', asyncHandler(disconnect));

export default router;
