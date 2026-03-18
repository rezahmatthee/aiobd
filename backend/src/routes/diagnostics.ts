import { Router } from 'express';
import { connectVehicle, getLiveData, getDTCCodes, clearDTCCodes } from '../controllers/diagnostics';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.post('/connect', connectVehicle);
router.get('/live/:vehicleId', getLiveData);
router.get('/codes/:vehicleId', getDTCCodes);
router.post('/clear/:vehicleId', clearDTCCodes);

export default router;
