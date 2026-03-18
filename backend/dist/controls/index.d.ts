/**
 * Bidirectional Controls Module (Phase 5)
 *
 * This module will implement:
 * - Active tests (fan cycling, injector tests, ABS pump)
 * - Actuator control
 * - Permission and safeguard system
 * - Undo/safety mechanisms
 *
 * NOT YET IMPLEMENTED - Planned for Phase 5
 */
export interface BidirectionalControl {
    name: string;
    description: string;
    safetyLevel: 'low' | 'medium' | 'high';
    requiresConfirmation: boolean;
}
export declare const AVAILABLE_CONTROLS: BidirectionalControl[];
export declare class BidirectionalControlService {
    executeControl(_controlName: string, _vehicleId: string): Promise<void>;
}
export declare const bidirectionalControlService: BidirectionalControlService;
//# sourceMappingURL=index.d.ts.map