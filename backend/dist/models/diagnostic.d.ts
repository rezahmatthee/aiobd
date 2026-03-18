import mongoose, { Document } from 'mongoose';
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
export declare const Diagnostic: mongoose.Model<IDiagnostic, {}, {}, {}, mongoose.Document<unknown, {}, IDiagnostic, {}, {}> & IDiagnostic & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=diagnostic.d.ts.map