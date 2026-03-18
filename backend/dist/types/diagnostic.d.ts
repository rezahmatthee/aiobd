import { ProtocolType } from './protocol';
import { PIDValue } from './pid';
export declare enum DiagnosticSessionStatus {
    IDLE = "IDLE",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    ERROR = "ERROR"
}
export interface DTCCode {
    code: string;
    description: string;
    system: 'P' | 'C' | 'B' | 'U';
    type: 'stored' | 'pending' | 'permanent';
}
export interface FreezeFrame {
    dtcCode: string;
    pidValues: PIDValue[];
    timestamp: Date;
}
export interface DiagnosticSession {
    id: string;
    vehicleId: string;
    protocol: ProtocolType;
    status: DiagnosticSessionStatus;
    startedAt: Date;
    endedAt?: Date;
    pidValues: PIDValue[];
    dtcCodes: DTCCode[];
    freezeFrames: FreezeFrame[];
}
export interface VehicleInfo {
    vin?: string;
    calibrationId?: string;
    cvn?: string;
    ecuName?: string;
    performanceTracking?: number[];
}
//# sourceMappingURL=diagnostic.d.ts.map