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

export const AVAILABLE_CONTROLS: BidirectionalControl[] = [
  { name: 'FAN_CYCLE', description: 'Cycle cooling fan', safetyLevel: 'low', requiresConfirmation: false },
  { name: 'INJECTOR_TEST', description: 'Individual injector actuation test', safetyLevel: 'medium', requiresConfirmation: true },
  { name: 'ABS_PUMP', description: 'ABS pump activation', safetyLevel: 'high', requiresConfirmation: true },
];

export class BidirectionalControlService {
  async executeControl(_controlName: string, _vehicleId: string): Promise<void> {
    throw new Error('Bidirectional controls not yet implemented (Phase 5)');
  }
}

export const bidirectionalControlService = new BidirectionalControlService();
