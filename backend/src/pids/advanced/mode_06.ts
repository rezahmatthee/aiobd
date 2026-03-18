/**
 * Mode $06 - On-board Monitor Test Results
 * SAE J1979 standard for on-board diagnostic monitor test results
 */

export enum MonitorType {
  OXYGEN_SENSOR = 'OXYGEN_SENSOR',
  FUEL_SYSTEM = 'FUEL_SYSTEM',
  EVAP_SYSTEM = 'EVAP_SYSTEM',
  EGR_SYSTEM = 'EGR_SYSTEM',
  CATALYST = 'CATALYST',
  HEATED_CATALYST = 'HEATED_CATALYST',
  SECONDARY_AIR = 'SECONDARY_AIR',
  MISFIRE = 'MISFIRE',
  COMPREHENSIVE = 'COMPREHENSIVE',
}

export interface MonitorTestResult {
  testId: number;
  componentId: number;
  monitorType: MonitorType;
  testValue: number;
  minLimit: number;
  maxLimit: number;
  passed: boolean;
  enabled: boolean;
  complete: boolean;
}

export interface Mode06Response {
  vehicleId: string;
  timestamp: Date;
  tests: MonitorTestResult[];
}

// Monitor test ID descriptions per SAE J1979
export const MONITOR_TEST_IDS: Record<number, string> = {
  0x00: 'Supported Test IDs',
  0x01: 'Oxygen Sensor Monitor - Rich-to-Lean Threshold Voltage',
  0x02: 'Oxygen Sensor Monitor - Lean-to-Rich Threshold Voltage',
  0x03: 'Oxygen Sensor Monitor - Low Sensor Voltage Threshold',
  0x04: 'Oxygen Sensor Monitor - High Sensor Voltage Threshold',
  0x05: 'Oxygen Sensor Monitor - Low Sensor Response Time Threshold',
  0x06: 'Oxygen Sensor Monitor - High Sensor Response Time Threshold',
  0x07: 'Oxygen Sensor Monitor - Minimum Voltage for Switch Time Measurement',
  0x08: 'Oxygen Sensor Monitor - Maximum Voltage for Switch Time Measurement',
  0x09: 'Oxygen Sensor Monitor - Time between Voltage Transitions Threshold',
  0x0A: 'Oxygen Sensor Monitor - Sensor Period Threshold',
  0x0B: 'Catalyst Monitor - Efficiency Below Threshold',
  0x0C: 'EGR Monitor - Pressure Sensor Low Flow Threshold',
  0x0D: 'EGR Monitor - Pressure Sensor High Flow Threshold',
  0x0E: 'EVAP Monitor - Purge Flow Low Threshold',
  0x0F: 'EVAP Monitor - Purge Flow High Threshold',
};

// Component IDs for each monitor type
export const COMPONENT_IDS: Record<number, string> = {
  0x01: 'Bank 1 - Sensor 1',
  0x02: 'Bank 1 - Sensor 2',
  0x11: 'Bank 2 - Sensor 1',
  0x12: 'Bank 2 - Sensor 2',
};

/**
 * Parse Mode $06 response bytes
 * Format: [Test ID][Component ID][Test Value High][Test Value Low][Min Limit High][Min Limit Low][Max Limit High][Max Limit Low]
 */
export function parseMode06Response(bytes: number[]): MonitorTestResult | null {
  if (bytes.length < 8) {
    return null;
  }

  const testId = bytes[0];
  const componentId = bytes[1];
  const testValue = (bytes[2] << 8) | bytes[3];
  const minLimit = (bytes[4] << 8) | bytes[5];
  const maxLimit = (bytes[6] << 8) | bytes[7];

  const passed = testValue >= minLimit && testValue <= maxLimit;
  const monitorType = getMonitorTypeForTestId(testId);

  return {
    testId,
    componentId,
    monitorType,
    testValue,
    minLimit,
    maxLimit,
    passed,
    enabled: true,
    complete: true,
  };
}

function getMonitorTypeForTestId(testId: number): MonitorType {
  if (testId >= 0x01 && testId <= 0x0A) return MonitorType.OXYGEN_SENSOR;
  if (testId === 0x0B) return MonitorType.CATALYST;
  if (testId === 0x0C || testId === 0x0D) return MonitorType.EGR_SYSTEM;
  if (testId === 0x0E || testId === 0x0F) return MonitorType.EVAP_SYSTEM;
  return MonitorType.COMPREHENSIVE;
}

/**
 * Build Mode $06 request bytes
 * @param testId - Test ID to request (0x00 for all supported)
 */
export function buildMode06Request(testId = 0x00): number[] {
  return [0x06, testId];
}
