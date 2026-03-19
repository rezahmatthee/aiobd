import { Request, Response } from 'express';
import { VehicleService } from '../services/vehicle';
import { ApiResponse, PaginatedResponse } from '../types';
import { VehicleRecord } from '../services/vehicle';

const vehicleService = new VehicleService();

function ts(): string {
  return new Date().toISOString();
}

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId ?? '';
  const vehicle = await vehicleService.createVehicle({ ...req.body as Record<string, unknown>, userId } as Parameters<typeof vehicleService.createVehicle>[0]);
  const response: ApiResponse<VehicleRecord> = { success: true, data: vehicle, timestamp: ts() };
  res.status(201).json(response);
};

export const getVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await vehicleService.getVehicle(req.params.id ?? '');
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found', timestamp: ts() });
    return;
  }
  const response: ApiResponse<VehicleRecord> = { success: true, data: vehicle, timestamp: ts() };
  res.status(200).json(response);
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await vehicleService.updateVehicle(req.params.id ?? '', req.body as Record<string, unknown>);
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found', timestamp: ts() });
    return;
  }
  const response: ApiResponse<VehicleRecord> = { success: true, data: vehicle, timestamp: ts() };
  res.status(200).json(response);
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  const deleted = await vehicleService.deleteVehicle(req.params.id ?? '');
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Vehicle not found', timestamp: ts() });
    return;
  }
  const response: ApiResponse<null> = { success: true, message: 'Vehicle deleted', timestamp: ts() };
  res.status(200).json(response);
};

export const listVehicles = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId ?? '';
  const page = parseInt(String(req.query['page'] ?? '1'), 10);
  const limit = parseInt(String(req.query['limit'] ?? '20'), 10);
  const { data, total } = await vehicleService.listVehicles(userId, { page, limit });
  const response: PaginatedResponse<VehicleRecord> = {
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    timestamp: ts(),
  };
  res.status(200).json(response);
};

export const searchVehicles = async (req: Request, res: Response): Promise<void> => {
  const query = String(req.query['q'] ?? '');
  const page = parseInt(String(req.query['page'] ?? '1'), 10);
  const limit = parseInt(String(req.query['limit'] ?? '20'), 10);
  const { data, total } = await vehicleService.searchVehicles(query, { page, limit });
  const response: PaginatedResponse<VehicleRecord> = {
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    timestamp: ts(),
  };
  res.status(200).json(response);
};
