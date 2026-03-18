import { PIDDefinition, PIDValue } from '../types/pid';
import { DTCCode } from '../types/diagnostic';
export declare class OBDParser {
    parseRawResponse(raw: string): number[];
    parsePIDResponse(raw: string, pid: PIDDefinition): PIDValue | null;
    parseDTCResponse(raw: string): DTCCode[];
    decodeDTCCode(hex: string): DTCCode | null;
    private getDTCSystem;
    parseVIN(raw: string): string;
    calculateChecksum(bytes: number[]): number;
}
export declare const obdParser: OBDParser;
//# sourceMappingURL=obd_parser.d.ts.map