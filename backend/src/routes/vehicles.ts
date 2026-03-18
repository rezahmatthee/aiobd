import { Router } from 'express';
import { getVehicles, createVehicle, getVehicle, deleteVehicle } from '../controllers/vehicles';
import { authMiddleware } from '../middleware/auth';
import { validateVehicleInput } from '../middleware/validation';

const router = Router();

router.use(authMiddleware);
router.get('/', getVehicles);
router.post('/', validateVehicleInput, createVehicle);
router.get('/:id', getVehicle);
router.delete('/:id', deleteVehicle);

export default router;
