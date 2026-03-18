import { DiagnosticSession, DTCCode } from '../types/diagnostic';
import { ProtocolType } from '../types/protocol';
import { PIDValue } from '../types/pid';
export declare class DiagnosticService {
    private activeSessions;
    createSession(vehicleId: string, protocol: ProtocolType): DiagnosticSession;
    startSession(sessionId: string): Promise<void>;
    readPID(sessionId: string, mode: number, pid: number): Promise<PIDValue | null>;
    readDTCCodes(sessionId: string): Promise<DTCCode[]>;
    endSession(sessionId: string): DiagnosticSession | null;
    getSession(sessionId: string): DiagnosticSession | undefined;
}
export declare const diagnosticService: DiagnosticService;
//# sourceMappingURL=diagnostic.d.ts.map