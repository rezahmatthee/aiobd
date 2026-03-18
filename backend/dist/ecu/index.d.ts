/**
 * ECU Flashing & Chip Tuning Module (Phase 4)
 *
 * This module will implement:
 * - UDS (ISO 14229) protocol for ECU communication
 * - Firmware reading and writing
 * - Calibration data management
 * - Safety checks and verification
 *
 * NOT YET IMPLEMENTED - Planned for Phase 4
 */
export interface ECUFlashConfig {
    vehicleId: string;
    ecuAddress: number;
    firmwarePath: string;
    verifyAfterWrite: boolean;
}
export interface ECUFlashResult {
    success: boolean;
    message: string;
    checksumVerified?: boolean;
}
export declare class ECUFlashingService {
    readECU(_config: Partial<ECUFlashConfig>): Promise<Buffer>;
    writeECU(_config: ECUFlashConfig): Promise<ECUFlashResult>;
}
export declare const ecuFlashingService: ECUFlashingService;
//# sourceMappingURL=index.d.ts.map