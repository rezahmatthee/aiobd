import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { vehicleService } from '../services/vehicle';
import { logger } from '../utils/logger';

export async function getVehicles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const vehicles = await vehicleService.getVehiclesByUser(req.userId!);
    res.json({ vehicles });
  } catch (err) {
    logger.error('Get vehicles error', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
}

export async function createVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const vehicle = await vehicleService.createVehicle(req.userId!, req.body);
    res.status(201).json({ vehicle });
  } catch (err) {
    logger.error('Create vehicle error', err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
}

export async function getVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id, req.userId!);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json({ vehicle });
  } catch (err) {
    logger.error('Get vehicle error', err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
}

export async function deleteVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const deleted = await vehicleService.deleteVehicle(req.params.id, req.userId!);
    if (!deleted) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    logger.error('Delete vehicle error', err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
}
