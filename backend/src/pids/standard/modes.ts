import { OBD2Service } from '../../types';

/** OBD2 mode/service descriptions */
export const OBD2_MODES: Record<number, string> = {
  0x01: 'Show Current Data',
  0x02: 'Show Freeze Frame Data',
  0x03: 'Show Stored Diagnostic Trouble Codes',
  0x04: 'Clear Diagnostic Trouble Codes and Stored Values',
  0x05: 'Test Results - Oxygen Sensor Monitoring (non-CAN)',
  0x06: 'Test Results - On-Board Monitoring (CAN)',
  0x07: 'Show Pending Diagnostic Trouble Codes',
  0x08: 'Control Operation of On-Board Component/System',
  0x09: 'Request Vehicle Information',
  0x0A: 'Permanent Diagnostic Trouble Codes',
  0x22: 'Read Data By Identifier (UDS/Enhanced)',
  0x23: 'Read Memory By Address (UDS)',
  0x2E: 'Write Data By Identifier (UDS)',
  0x2F: 'Input Output Control By Identifier (UDS)',
  0x31: 'Routine Control (UDS)',
  0x34: 'Request Download (UDS)',
  0x35: 'Request Upload (UDS)',
  0x36: 'Transfer Data (UDS)',
  0x37: 'Request Transfer Exit (UDS)',
  0x3E: 'Tester Present (UDS)',
  0x27: 'Security Access (UDS)',
  0x10: 'Diagnostic Session Control (UDS)',
  0x11: 'ECU Reset (UDS)',
  0x14: 'Clear Diagnostic Information (UDS)',
  0x19: 'Read DTC Information (UDS)',
};

/** Standard OBD2 service identifiers */
export const STANDARD_SERVICES = {
  CURRENT_DATA: OBD2Service.CURRENT_DATA,
  FREEZE_FRAME: OBD2Service.FREEZE_FRAME,
  DTC: OBD2Service.DTC,
  CLEAR_DTC: OBD2Service.CLEAR_DTC,
  O2_SENSOR_MONITORING: OBD2Service.O2_SENSOR_MONITORING,
  ONBOARD_MONITORING: OBD2Service.ONBOARD_MONITORING,
  PENDING_DTC: OBD2Service.PENDING_DTC,
  CONTROL_OPERATION: OBD2Service.CONTROL_OPERATION,
  VEHICLE_INFO: OBD2Service.VEHICLE_INFO,
  PERMANENT_DTC: OBD2Service.PERMANENT_DTC,
} as const;

/** Maximum supported PID value per service */
export const SERVICE_MAX_PID: Record<number, number> = {
  0x01: 0xC0,
  0x02: 0xC0,
  0x06: 0xFF,
  0x09: 0x0A,
};

/** Response byte offset for each service */
export const SERVICE_RESPONSE_OFFSET: Record<number, number> = {
  0x01: 2,
  0x02: 3,
  0x03: 2,
  0x07: 2,
  0x09: 2,
};

/**
 * Returns true if the given service number is a standard OBD2 mode
 */
export function isStandardMode(serviceNumber: number): boolean {
  return serviceNumber >= 0x01 && serviceNumber <= 0x0A;
}

/**
 * Returns true if the given service number is a UDS/enhanced mode
 */
export function isUDSMode(serviceNumber: number): boolean {
  return [0x10, 0x11, 0x14, 0x19, 0x22, 0x23, 0x27, 0x2E, 0x2F, 0x31, 0x34, 0x35, 0x36, 0x37, 0x3E].includes(serviceNumber);
}

/**
 * Returns the human-readable description for a mode number, or null if unknown
 */
export function getModeDescription(serviceNumber: number): string | null {
  return OBD2_MODES[serviceNumber] ?? null;
}

/**
 * Returns the positive response SID (service ID + 0x40)
 */
export function getPositiveResponseSID(requestSID: number): number {
  return (requestSID + 0x40) & 0xFF;
}

/**
 * Validates that the response SID matches the expected positive response
 */
export function validateResponseSID(requestSID: number, responseSID: number): boolean {
  return responseSID === getPositiveResponseSID(requestSID);
}

/**
 * Parses a 4-byte PID support bitmask into an array of supported PID numbers
 */
export function parsePIDSupportBitmask(startPid: number, bytes: number[]): number[] {
  const supported: number[] = [];
  let pid = startPid + 1;
  for (const byte of bytes) {
    for (let bit = 7; bit >= 0; bit--) {
      if ((byte >> bit) & 1) {
        supported.push(pid);
      }
      pid++;
    }
  }
  return supported;
}
