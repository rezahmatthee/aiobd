import { Vehicle, IVehicle, IVehicleDocument } from '../models/vehicle';
import { logger } from '../utils/logger';

export class VehicleService {
  async createVehicle(userId: string, data: Partial<IVehicle>): Promise<IVehicleDocument> {
    const vehicle = new Vehicle({ ...data, userId });
    await vehicle.save();
    logger.info(`Created vehicle ${vehicle._id} for user ${userId}`);
    return vehicle;
  }

  async getVehiclesByUser(userId: string): Promise<IVehicleDocument[]> {
    return Vehicle.find({ userId }).sort({ createdAt: -1 });
  }

  async getVehicleById(vehicleId: string, userId: string): Promise<IVehicleDocument | null> {
    return Vehicle.findOne({ _id: vehicleId, userId });
  }

  async updateVehicle(vehicleId: string, userId: string, data: Partial<IVehicle>): Promise<IVehicleDocument | null> {
    return Vehicle.findOneAndUpdate({ _id: vehicleId, userId }, data, { new: true });
  }

  async deleteVehicle(vehicleId: string, userId: string): Promise<boolean> {
    const result = await Vehicle.deleteOne({ _id: vehicleId, userId });
    return result.deletedCount > 0;
  }
}

export const vehicleService = new VehicleService();
