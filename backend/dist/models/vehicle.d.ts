import mongoose, { HydratedDocument } from 'mongoose';
export interface IVehicle {
    userId: mongoose.Types.ObjectId;
    vin?: string;
    make: string;
    vehicleModel: string;
    year: number;
    licensePlate?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type IVehicleDocument = HydratedDocument<IVehicle>;
export declare const Vehicle: mongoose.Model<IVehicle, {}, {}, {}, mongoose.Document<unknown, {}, IVehicle, {}, {}> & IVehicle & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=vehicle.d.ts.map