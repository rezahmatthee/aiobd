import mongoose, { Schema } from 'mongoose';

export interface IDiagnostic extends mongoose.Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  protocol: string;
  status: string;
  dtcs: unknown[];
  readings: unknown[];
  startedAt: Date;
  endedAt?: Date;
  metadata: Record<string, unknown>;
}

const DiagnosticSchema = new Schema<IDiagnostic>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    protocol: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'IDLE',
    },
    dtcs: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    readings: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

DiagnosticSchema.index({ userId: 1, startedAt: -1 });
DiagnosticSchema.index({ vehicleId: 1, startedAt: -1 });

const Diagnostic = mongoose.model<IDiagnostic>('Diagnostic', DiagnosticSchema);
export default Diagnostic;
