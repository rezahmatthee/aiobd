/**
 * OBD2 hex response parser and DTC decoder
 */
import { PIDReading, OBD2Service, SupportedPIDs } from '../types/pid';
import { DTCCode, DTCCategory, DTCSeverity } from '../types/diagnostic';
import { STANDARD_PIDS } from './constants';
import { sanitizeHex } from './validators';

/** Parse a raw OBD2 response string into bytes */
export function parseResponseBytes(raw: string): Buffer {
  const cleaned = sanitizeHex(raw);
  if (cleaned.length % 2 !== 0) {
    throw new Error(`Invalid hex string length: ${cleaned}`);
  }
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(parseInt(cleaned.slice(i, i + 2), 16));
  }
  return Buffer.from(bytes);
}

/** Decode a Mode 01 PID response into a PIDReading */
export function decodePIDResponse(raw: string, pid: number): PIDReading {
  const bytes = parseResponseBytes(raw);
  const definition = STANDARD_PIDS[pid];

  const result: PIDReading = {
    pid,
    service: OBD2Service.CURRENT_DATA,
    name: definition?.name ?? `PID_${pid.toString(16).toUpperCase().padStart(2, '0')}`,
    value: 0,
    unit: definition?.unit ?? '',
    rawBytes: raw,
    timestamp: new Date(),
    valid: false,
  };

  if (!definition) {
    result.value = bytes.length > 0 ? (bytes[0] ?? 0) : 0;
    result.valid = bytes.length > 0;
    return result;
  }

  const A = bytes[0] ?? 0;
  const B = bytes[1] ?? 0;
  const C = bytes[2] ?? 0;
  const D = bytes[3] ?? 0;

  switch (pid) {
    case 0x04: // Engine load
    case 0x11: // Throttle position
    case 0x2F: // Fuel level
      result.value = Math.round((A / 2.55) * 100) / 100;
      break;
    case 0x05: // Coolant temp
    case 0x0F: // Intake air temp
    case 0x46: // Ambient air temp
    case 0x5C: // Oil temp
      result.value = A - 40;
      break;
    case 0x0C: // Engine RPM
      result.value = (A * 256 + B) / 4;
      break;
    case 0x0D: // Vehicle speed
      result.value = A;
      break;
    case 0x0E: // Timing advance
      result.value = A / 2 - 64;
      break;
    case 0x10: // MAF
      result.value = (A * 256 + B) / 100;
      break;
    case 0x1F: // Run time
      result.value = A * 256 + B;
      break;
    case 0x42: // Control module voltage
      result.value = (A * 256 + B) / 1000;
      break;
    case 0x00: // Supported PIDs 01-20
      result.value = (A * 0x1000000 + B * 0x10000 + C * 0x100 + D) >>> 0;
      break;
    default:
      result.value = bytes.length > 0 ? (bytes[0] ?? 0) : 0;
  }

  result.valid = true;
  return result;
}

/**
 * Decode DTC bytes from Mode 03/07/0A responses.
 * Each DTC is 2 bytes: [byte1 byte2]
 * Byte1 high 2 bits: category (00=P, 01=C, 10=B, 11=U)
 * Byte1 next 2 bits: first digit (0-3)
 * Remaining 12 bits: 3 hex digits
 */
export function decodeDTCBytes(raw: string, isPending = false, isPermanent = false): DTCCode[] {
  const bytes = parseResponseBytes(raw);
  const dtcs: DTCCode[] = [];

  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const b1 = bytes[i] ?? 0;
    const b2 = bytes[i + 1] ?? 0;

    if (b1 === 0 && b2 === 0) continue;

    const categoryBits = (b1 & 0xC0) >> 6;
    const firstDigit = (b1 & 0x30) >> 4;
    const secondDigit = b1 & 0x0F;
    const thirdDigit = (b2 & 0xF0) >> 4;
    const fourthDigit = b2 & 0x0F;

    const categoryMap: Record<number, string> = { 0: 'P', 1: 'C', 2: 'B', 3: 'U' };
    const categoryChar = categoryMap[categoryBits] ?? 'P';
    const code = `${categoryChar}${firstDigit}${secondDigit.toString(16).toUpperCase()}${thirdDigit.toString(16).toUpperCase()}${fourthDigit.toString(16).toUpperCase()}`;

    const category = (Object.values(DTCCategory) as string[]).includes(categoryChar)
      ? (categoryChar as DTCCategory)
      : DTCCategory.POWERTRAIN;

    dtcs.push({
      code,
      category,
      description: getDTCDescription(code),
      severity: getDTCSeverity(code),
      isPending,
      isPermanent,
      freezeFrameAvailable: !isPending && !isPermanent,
    });
  }

  return dtcs;
}

/** Get a basic DTC description based on code pattern */
function getDTCDescription(code: string): string {
  const descriptions: Record<string, string> = {
    P0300: 'Random/Multiple Cylinder Misfire Detected',
    P0301: 'Cylinder 1 Misfire Detected',
    P0302: 'Cylinder 2 Misfire Detected',
    P0303: 'Cylinder 3 Misfire Detected',
    P0304: 'Cylinder 4 Misfire Detected',
    P0420: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    P0171: 'System Too Lean (Bank 1)',
    P0172: 'System Too Rich (Bank 1)',
    P0113: 'Intake Air Temperature Sensor 1 Circuit High',
    P0116: 'Engine Coolant Temperature Sensor 1 Circuit Range/Performance',
    P0401: 'Exhaust Gas Recirculation Flow Insufficient Detected',
    P0442: 'Evaporative Emission System Leak Detected (Small Leak)',
    P0455: 'Evaporative Emission System Leak Detected (Large Leak)',
    P0500: 'Vehicle Speed Sensor Malfunction',
    P0600: 'Serial Communication Link Malfunction',
  };
  return descriptions[code.toUpperCase()] ?? `Diagnostic Trouble Code ${code}`;
}

/** Determine DTC severity based on code */
function getDTCSeverity(code: string): DTCSeverity {
  const critical = ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308'];
  const high = ['P0420', 'P0171', 'P0172', 'P0401', 'P0600'];
  const medium = ['P0442', 'P0455', 'P0500'];

  if (critical.includes(code.toUpperCase())) return DTCSeverity.CRITICAL;
  if (high.includes(code.toUpperCase())) return DTCSeverity.HIGH;
  if (medium.includes(code.toUpperCase())) return DTCSeverity.MEDIUM;
  return DTCSeverity.LOW;
}

/** Decode supported PIDs bitmask */
export function decodeSupportedPIDs(raw: string, service: OBD2Service, basePID: number): SupportedPIDs {
  const bytes = parseResponseBytes(raw);
  const supported: number[] = [];

  for (let byteIdx = 0; byteIdx < bytes.length && byteIdx < 4; byteIdx++) {
    const byte = bytes[byteIdx] ?? 0;
    for (let bit = 7; bit >= 0; bit--) {
      if (byte & (1 << bit)) {
        supported.push(basePID + (byteIdx * 8) + (8 - 1 - bit) + 1);
      }
    }
  }

  return { service, pids: supported, raw };
}

/** Check if an ELM327 response indicates an error */
export function isErrorResponse(response: string): boolean {
  const errorStrings = ['ERROR', 'NO DATA', 'UNABLE TO CONNECT', 'BUS INIT', 'BUS ERROR', 'STOPPED', '?'];
  return errorStrings.some(err => response.toUpperCase().includes(err));
}

/** Strip ELM327 prompt and whitespace from response */
export function cleanResponse(response: string): string {
  return response.replace(/>/g, '').replace(/\r/g, '').trim();
}
