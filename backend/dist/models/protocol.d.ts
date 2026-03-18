import mongoose, { Document } from 'mongoose';
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
export declare const ProtocolSession: mongoose.Model<IProtocolSession, {}, {}, {}, mongoose.Document<unknown, {}, IProtocolSession, {}, {}> & IProtocolSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=protocol.d.ts.map