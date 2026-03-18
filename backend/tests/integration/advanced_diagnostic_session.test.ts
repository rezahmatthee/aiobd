/**
 * Integration Tests for Advanced Diagnostic Session
 * End-to-end testing of Mode $06, Mode $09, and freeze frame operations
 */

import { AdvancedDiagnosticService, DiagnosticSession } from '../../src/services/advanced_diagnostic';
import { MonitorType } from '../../src/pids/advanced/mode_06';
import { VehicleInfoType } from '../../src/pids/advanced/mode_09';

// Helper to create a mock diagnostic session
function createMockSession(vehicleId: string, mockResponses: Record<string, number[]> = {}): DiagnosticSession {
  return {
    vehicleId,
    connected: true,
    sendRequest: async (bytes: number[]) => {
      const key = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
      return mockResponses[key] || [0x00, 0x00];
    },
  };
}

describe('AdvancedDiagnosticService - Mode $06', () => {
  it('should return error when session is not connected', async () => {
    const session: DiagnosticSession = {
      vehicleId: 'test-vehicle',
      connected: false,
      sendRequest: async () => [],
    };
    const service = new AdvancedDiagnosticService(session);
    const result = await service.requestMonitorTests();
    expect(result.success).toBe(false);
    expect(result.error).toContain('No active diagnostic session');
  });

  it('should successfully request monitor tests when connected', async () => {
    // Mock response: one 8-byte monitor test result
    // testId=0x01, componentId=0x01, value=0x03 0x4B (843), min=0x00 0x4B (75), max=0x00 0xFF (255)
    const session = createMockSession('vehicle1', {
      '0600': [0x01, 0x01, 0x03, 0x4b, 0x00, 0x4b, 0x00, 0xff],
    });
    const service = new AdvancedDiagnosticService(session);
    const result = await service.requestMonitorTests();
    expect(result.success).toBe(true);
  });

  it('should cache monitor test results', async () => {
    const session = createMockSession('vehicle1', {
      '0600': [0x01, 0x01, 0x03, 0x4b, 0x00, 0x4b, 0x00, 0xff],
    });
    const service = new AdvancedDiagnosticService(session);
    await service.requestMonitorTests();

    const cached = service.getCachedMonitorTests();
    expect(cached).not.toBeNull();
    expect(Array.isArray(cached)).toBe(true);
  });

  it('should return null for cache miss', () => {
    const session = createMockSession('vehicle2');
    const service = new AdvancedDiagnosticService(session);
    expect(service.getCachedMonitorTests()).toBeNull();
  });
});

describe('AdvancedDiagnosticService - Mode $09', () => {
  it('should return error when session is not connected', async () => {
    const session: DiagnosticSession = {
      vehicleId: 'test-vehicle',
      connected: false,
      sendRequest: async () => [],
    };
    const service = new AdvancedDiagnosticService(session);
    const result = await service.requestVehicleInfo();
    expect(result.success).toBe(false);
    expect(result.error).toContain('No active diagnostic session');
  });

  it('should successfully request vehicle info when connected', async () => {
    // VIN: "1G1FB3K359B307896"
    const vinBytes = [0x01, 0x31, 0x47, 0x31, 0x46, 0x42, 0x33, 0x4b, 0x33, 0x35, 0x39, 0x42, 0x33, 0x30, 0x37, 0x38, 0x39, 0x36];
    const session = createMockSession('vehicle1', {
      [`09${VehicleInfoType.VIN.toString(16).padStart(2, '0')}`]: vinBytes,
    });
    const service = new AdvancedDiagnosticService(session);
    const result = await service.requestVehicleInfo();
    expect(result.success).toBe(true);
  });

  it('should cache vehicle info results', async () => {
    const session = createMockSession('vehicle1');
    const service = new AdvancedDiagnosticService(session);
    await service.requestVehicleInfo();

    const cached = service.getCachedVehicleInfo();
    expect(cached).not.toBeNull();
  });

  it('should return null for vehicle info cache miss', () => {
    const session = createMockSession('vehicle2');
    const service = new AdvancedDiagnosticService(session);
    expect(service.getCachedVehicleInfo()).toBeNull();
  });
});

describe('AdvancedDiagnosticService - Freeze Frames', () => {
  it('should return error when session is not connected', async () => {
    const session: DiagnosticSession = {
      vehicleId: 'test-vehicle',
      connected: false,
      sendRequest: async () => [],
    };
    const service = new AdvancedDiagnosticService(session);
    const result = await service.captureFreezeFrame('P0300');
    expect(result.success).toBe(false);
    expect(result.error).toContain('No active diagnostic session');
  });

  it('should start with empty freeze frames', () => {
    const session = createMockSession('vehicle1');
    const service = new AdvancedDiagnosticService(session);
    expect(service.getFreezeFrames()).toEqual([]);
  });

  it('should return null for non-existent freeze frame', () => {
    const session = createMockSession('vehicle1');
    const service = new AdvancedDiagnosticService(session);
    expect(service.getFreezeFrameById('non-existent')).toBeNull();
  });

  it('should return false when clearing non-existent freeze frame', () => {
    const session = createMockSession('vehicle1');
    const service = new AdvancedDiagnosticService(session);
    expect(service.clearFreezeFrame('non-existent')).toBe(false);
  });
});

describe('AdvancedDiagnosticService - Hex parsing methods', () => {
  let service: AdvancedDiagnosticService;

  beforeEach(() => {
    const session = createMockSession('vehicle1');
    service = new AdvancedDiagnosticService(session);
  });

  it('should parse monitor tests from hex', () => {
    const hexResponses = ['46 01 01 03 4B 00 4B 00 FF'];
    const results = service.parseMonitorTestsFromHex(hexResponses);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should parse vehicle info from hex', () => {
    const hexResponses = ['49 02 01 31 47 31 46 42 33 4B 33 35 39 42 33 30 37 38 39 36'];
    const result = service.parseVehicleInfoFromHex(hexResponses);
    expect(result.vin).toBe('1G1FB3K359B307896');
  });

  it('should parse freeze frame from hex', () => {
    const hexResponse = '03 00 04 78 05 5A 0C 0B B8';
    const result = service.parseFreezeFrameFromHex('frame1', hexResponse);
    expect(result).not.toBeNull();
    expect(result!.frameId).toBe('frame1');
  });
});

describe('End-to-end Mode $06 flow', () => {
  it('should complete full Mode $06 request, cache, and retrieve', async () => {
    const mockMonitorBytes = [0x01, 0x01, 0x03, 0x4b, 0x00, 0x4b, 0x00, 0xff];
    const session = createMockSession('e2e-vehicle', {
      '0600': mockMonitorBytes,
    });
    const service = new AdvancedDiagnosticService(session);

    // Request and store
    const requestResult = await service.requestMonitorTests();
    expect(requestResult.success).toBe(true);

    // Retrieve from cache
    const cached = service.getCachedMonitorTests();
    expect(cached).not.toBeNull();
  });
});

describe('End-to-end Mode $09 flow', () => {
  it('should complete full Mode $09 request, cache, and retrieve', async () => {
    const session = createMockSession('e2e-vehicle');
    const service = new AdvancedDiagnosticService(session);

    const requestResult = await service.requestVehicleInfo();
    expect(requestResult.success).toBe(true);

    const cached = service.getCachedVehicleInfo();
    expect(cached).not.toBeNull();
  });
});
