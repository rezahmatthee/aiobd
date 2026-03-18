import mongoose, { Document, Schema } from 'mongoose';
import { ProtocolType } from '../types/protocol';

export interface IDiagnostic extends Document {
  vehicleId: mongoose.Types.ObjectId;
  protocol: ProtocolType;
  timestamp: Date;
  pidValues: Array<{
    pid: number;
    mode: number;
    name: string;
    value: number | string;
    unit: string;
  }>;
  dtcCodes: Array<{
    code: string;
    description: string;
    system: string;
    type: string;
  }>;
  sessionDuration?: number;
}

const diagnosticSchema = new Schema<IDiagnostic>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    protocol: { type: String, enum: Object.values(ProtocolType), required: true },
    timestamp: { type: Date, default: Date.now },
    pidValues: [
      {
        pid: Number,
        mode: Number,
        name: String,
        value: Schema.Types.Mixed,
        unit: String,
      },
    ],
    dtcCodes: [
      {
        code: String,
        description: String,
        system: String,
        type: String,
      },
    ],
    sessionDuration: Number,
  },
  { timestamps: true }
);

export const Diagnostic = mongoose.model<IDiagnostic>('Diagnostic', diagnosticSchema);
