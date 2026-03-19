import mongoose, { Schema } from 'mongoose';

export interface IVehicle extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  vin: string;
  vehicleMake: string;
  vehicleModel: string;
  year: number;
  engine: string;
  transmission: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vin: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 17,
    },
    vehicleMake: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 2,
    },
    engine: {
      type: String,
      required: true,
      trim: true,
    },
    transmission: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

VehicleSchema.index({ userId: 1, vin: 1 });
VehicleSchema.index({ make: 'text', model: 'text', vin: 'text' });

const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
export default Vehicle;
