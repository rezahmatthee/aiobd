import { Router } from 'express';
import {
  setActuator,
  getActuatorStatus,
  startLiveControl,
  stopLiveControl,
  adjustLiveParameter,
} from '../controllers/controls';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.use(authenticate);

router.post('/:sessionId/actuator', asyncHandler(setActuator));
router.get('/:sessionId/actuator/:type', asyncHandler(getActuatorStatus));
router.post('/:sessionId/live/start', asyncHandler(startLiveControl));
router.post('/:sessionId/live/stop', asyncHandler(stopLiveControl));
router.post('/:sessionId/live/adjust', asyncHandler(adjustLiveParameter));

export default router;
