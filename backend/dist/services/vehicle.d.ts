import { IVehicle, IVehicleDocument } from '../models/vehicle';
export declare class VehicleService {
    createVehicle(userId: string, data: Partial<IVehicle>): Promise<IVehicleDocument>;
    getVehiclesByUser(userId: string): Promise<IVehicleDocument[]>;
    getVehicleById(vehicleId: string, userId: string): Promise<IVehicleDocument | null>;
    updateVehicle(vehicleId: string, userId: string, data: Partial<IVehicle>): Promise<IVehicleDocument | null>;
    deleteVehicle(vehicleId: string, userId: string): Promise<boolean>;
}
export declare const vehicleService: VehicleService;
//# sourceMappingURL=vehicle.d.ts.map