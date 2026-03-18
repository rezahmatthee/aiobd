"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bidirectionalControlService = exports.BidirectionalControlService = exports.AVAILABLE_CONTROLS = void 0;
exports.AVAILABLE_CONTROLS = [
    { name: 'FAN_CYCLE', description: 'Cycle cooling fan', safetyLevel: 'low', requiresConfirmation: false },
    { name: 'INJECTOR_TEST', description: 'Individual injector actuation test', safetyLevel: 'medium', requiresConfirmation: true },
    { name: 'ABS_PUMP', description: 'ABS pump activation', safetyLevel: 'high', requiresConfirmation: true },
];
class BidirectionalControlService {
    async executeControl(_controlName, _vehicleId) {
        throw new Error('Bidirectional controls not yet implemented (Phase 5)');
    }
}
exports.BidirectionalControlService = BidirectionalControlService;
exports.bidirectionalControlService = new BidirectionalControlService();
//# sourceMappingURL=index.js.map