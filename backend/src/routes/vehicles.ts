import { Router } from 'express';
import {
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  listVehicles,
  searchVehicles,
} from '../controllers/vehicles';
import { authenticate } from '../middleware/auth';
import { validateVehicle } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(listVehicles));
router.get('/search', asyncHandler(searchVehicles));
router.post('/', validateVehicle, asyncHandler(createVehicle));
router.get('/:id', asyncHandler(getVehicle));
router.put('/:id', validateVehicle, asyncHandler(updateVehicle));
router.delete('/:id', asyncHandler(deleteVehicle));

export default router;
