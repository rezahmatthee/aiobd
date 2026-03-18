import mongoose, { Document, Schema, HydratedDocument } from 'mongoose';

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

const vehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vin: { type: String, uppercase: true, trim: true },
    make: { type: String, required: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1980, max: new Date().getFullYear() + 1 },
    licensePlate: { type: String, uppercase: true, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

vehicleSchema.virtual('addedAt').get(function () {
  return (this as IVehicleDocument).createdAt;
});

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
