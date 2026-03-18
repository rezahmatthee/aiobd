/**
 * Advanced Diagnostic Database Models
 * MongoDB schemas for Mode $06, Mode $09, and freeze frame data
 */

import mongoose, { Document, Schema } from 'mongoose';

// MonitorTest Schema (Mode $06)
export interface IMonitorTest extends Document {
  vehicleId: string;
  testId: number;
  componentId: number;
  monitorType: string;
  testValue: number;
  minLimit: number;
  maxLimit: number;
  passed: boolean;
  enabled: boolean;
  complete: boolean;
  timestamp: Date;
}

const MonitorTestSchema = new Schema<IMonitorTest>({
  vehicleId: { type: String, required: true, index: true },
  testId: { type: Number, required: true },
  componentId: { type: Number, required: true },
  monitorType: { type: String, required: true },
  testValue: { type: Number, required: true },
  minLimit: { type: Number, required: true },
  maxLimit: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  enabled: { type: Boolean, default: true },
  complete: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
});

export const MonitorTest = mongoose.model<IMonitorTest>('MonitorTest', MonitorTestSchema);

// VehicleInfo Schema (Mode $09)
export interface IVehicleInfo extends Document {
  vehicleId: string;
  vin?: string;
  calibrationId?: string;
  cvn?: string;
  ecuName?: string;
  performanceTracking?: string;
  timestamp: Date;
}

const VehicleInfoSchema = new Schema<IVehicleInfo>({
  vehicleId: { type: String, required: true, unique: true, index: true },
  vin: { type: String },
  calibrationId: { type: String },
  cvn: { type: String },
  ecuName: { type: String },
  performanceTracking: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const VehicleInfo = mongoose.model<IVehicleInfo>('VehicleInfo', VehicleInfoSchema);

// FreezeFrame PID entry
export interface IFreezeFramePID {
  pid: number;
  name: string;
  value: number | string;
  unit: string;
  rawBytes: number[];
}

// FreezeFrame Schema
export interface IFreezeFrame extends Document {
  frameId: string;
  vehicleId: string;
  dtc: string;
  timestamp: Date;
  pids: IFreezeFramePID[];
  rawData: number[];
}

const FreezeFramePIDSchema = new Schema<IFreezeFramePID>({
  pid: { type: Number, required: true },
  name: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  unit: { type: String, required: true },
  rawBytes: [{ type: Number }],
});

const FreezeFrameSchema = new Schema<IFreezeFrame>({
  frameId: { type: String, required: true, unique: true, index: true },
  vehicleId: { type: String, required: true, index: true },
  dtc: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  pids: [FreezeFramePIDSchema],
  rawData: [{ type: Number }],
});

export const FreezeFrame = mongoose.model<IFreezeFrame>('FreezeFrame', FreezeFrameSchema);
