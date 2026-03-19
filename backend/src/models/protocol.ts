import mongoose, { Schema } from 'mongoose';

export interface IProtocolSession extends mongoose.Document {
  sessionId: string;
  vehicleId: mongoose.Types.ObjectId;
  protocolType: string;
  connectionState: string;
  config: Record<string, unknown>;
  startedAt: Date;
  endedAt?: Date;
}

const ProtocolSessionSchema = new Schema<IProtocolSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    protocolType: {
      type: String,
      required: true,
    },
    connectionState: {
      type: String,
      required: true,
      default: 'DISCONNECTED',
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

ProtocolSessionSchema.index({ vehicleId: 1, startedAt: -1 });

const ProtocolSession = mongoose.model<IProtocolSession>('ProtocolSession', ProtocolSessionSchema);
export default ProtocolSession;
