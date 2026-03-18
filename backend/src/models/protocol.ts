import mongoose, { Document, Schema } from 'mongoose';
import { ProtocolType, ProtocolStatus } from '../types/protocol';

export interface IProtocolSession extends Document {
  vehicleId: mongoose.Types.ObjectId;
  protocolType: ProtocolType;
  status: ProtocolStatus;
  adapterPort: string;
  startedAt: Date;
  endedAt?: Date;
  metadata: Record<string, unknown>;
}

const protocolSessionSchema = new Schema<IProtocolSession>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    protocolType: { type: String, enum: Object.values(ProtocolType), required: true },
    status: { type: String, enum: Object.values(ProtocolStatus), default: ProtocolStatus.DISCONNECTED },
    adapterPort: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const ProtocolSession = mongoose.model<IProtocolSession>('ProtocolSession', protocolSessionSchema);
