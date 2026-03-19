import { FreezeFrameData, PIDReading, OBD2Service, PIDDataType, PIDDefinition } from '../../types';

/** Subset of PID definitions relevant to freeze frame data */
export const FREEZE_FRAME_PIDS: PIDDefinition[] = [
  {
    pid: 0x04,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Engine Load',
    description: 'Calculated engine load at time of fault',
    unit: '%',
    dataType: PIDDataType.UINT8,
    min: 0,
    max: 100,
    formula: 'A * 100 / 255',
    byteCount: 1,
    supported: true,
  },
  {
    pid: 0x05,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Engine Coolant Temperature',
    description: 'Engine coolant temperature at time of fault',
    unit: '°C',
    dataType: PIDDataType.UINT8,
    min: -40,
    max: 215,
    formula: 'A - 40',
    byteCount: 1,
    supported: true,
  },
  {
    pid: 0x06,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Short Term Fuel Trim Bank 1',
    description: 'Short term fuel trim at time of fault',
    unit: '%',
    dataType: PIDDataType.INT8,
    min: -100,
    max: 99.2,
    formula: '(A - 128) * 100 / 128',
    byteCount: 1,
    supported: true,
  },
  {
    pid: 0x07,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Long Term Fuel Trim Bank 1',
    description: 'Long term fuel trim at time of fault',
    unit: '%',
    dataType: PIDDataType.INT8,
    min: -100,
    max: 99.2,
    formula: '(A - 128) * 100 / 128',
    byteCount: 1,
    supported: true,
  },
  {
    pid: 0x0B,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Intake Manifold Pressure',
    description: 'MAP sensor reading at time of fault',
    unit: 'kPa',
    dataType: PIDDataType.UINT8,
    min: 0,
    max: 255,
    formula: 'A',
    byteCount: 1,
    supported: true,
  },
  {
    pid: 0x0C,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Engine RPM',
    description: 'Engine RPM at time of fault',
    unit: 'RPM',
    dataType: PIDDataType.UINT16,
    min: 0,
    max: 16383.75,
    formula: '((A * 256) + B) / 4',
    byteCount: 2,
    supported: true,
  },
  {
    pid: 0x0D,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Vehicle Speed',
    description: 'Vehicle speed at time of fault',
    unit: 'km/h',
    dataType: PIDDataType.UINT8,
    min: 0,
    max: 255,
    formula: 'A',
    byteCount: 1,
    supported: true,
  },
  {
    pid: 0x0F,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Intake Air Temperature',
    description: 'IAT at time of fault',
    unit: '°C',
    dataType: PIDDataType.UINT8,
    min: -40,
    max: 215,
    formula: 'A - 40',
    byteCount: 1,
    supported: true,
  },
  {
    pid: 0x10,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Mass Air Flow Rate',
    description: 'MAF rate at time of fault',
    unit: 'g/s',
    dataType: PIDDataType.UINT16,
    min: 0,
    max: 655.35,
    formula: '((A * 256) + B) / 100',
    byteCount: 2,
    supported: true,
  },
  {
    pid: 0x11,
    service: OBD2Service.FREEZE_FRAME,
    name: 'Throttle Position',
    description: 'Throttle position at time of fault',
    unit: '%',
    dataType: PIDDataType.UINT8,
    min: 0,
    max: 100,
    formula: 'A * 100 / 255',
    byteCount: 1,
    supported: true,
  },
];

/** Evaluates a simple formula string with byte values A and B */
function evalFormula(formula: string, A: number, B = 0): number {
  // Safe evaluation of simple linear formulas
  const expr = formula
    .replace(/A/g, A.toString())
    .replace(/B/g, B.toString());
  try {
    // Simple arithmetic evaluation without eval()
    return Function(`"use strict"; return (${expr});`)() as number;
  } catch {
    return A;
  }
}

/** Parses a raw hex string into an array of byte values */
function hexToBytes(hex: string): number[] {
  const cleaned = hex.replace(/\s/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(parseInt(cleaned.substring(i, i + 2), 16));
  }
  return bytes;
}

/** Parses a single raw freeze frame PID value */
function parsePIDValue(def: PIDDefinition, bytes: number[]): number | string {
  if (def.dataType === PIDDataType.STRING) {
    return bytes.map((b) => String.fromCharCode(b)).join('');
  }
  const A = bytes[0] ?? 0;
  const B = bytes[1] ?? 0;
  return evalFormula(def.formula, A, B);
}

/** FreezeFrame parser class */
export class FreezeFrame {
  /**
   * Parse a raw freeze frame hex string from the ECU into FreezeFrameData
   * Format: 2-byte DTC code + 1-byte frame number + PID data pairs (PID, length, data...)
   */
  parse(raw: string): FreezeFrameData {
    const bytes = hexToBytes(raw);
    const timestamp = new Date();

    // First two bytes encode the triggering DTC
    let dtcCode = 'P0000';
    if (bytes.length >= 2) {
      const byte0 = bytes[0];
      const byte1 = bytes[1];
      const category = ['P', 'C', 'B', 'U'][(byte0 >> 6) & 0x03] ?? 'P';
      const digit1 = (byte0 >> 4) & 0x03;
      const digit2 = byte0 & 0x0F;
      const digit3 = (byte1 >> 4) & 0x0F;
      const digit4 = byte1 & 0x0F;
      dtcCode = `${category}${digit1}${digit2.toString(16).toUpperCase()}${digit3.toString(16).toUpperCase()}${digit4.toString(16).toUpperCase()}`;
    }

    const frameNumber = bytes[2] ?? 0;
    const readings: PIDReading[] = [];
    let offset = 3;

    while (offset < bytes.length - 1) {
      const pid = bytes[offset++];
      const byteCount = bytes[offset++];
      if (offset + byteCount > bytes.length) break;

      const dataBytes = bytes.slice(offset, offset + byteCount);
      offset += byteCount;

      const def = FREEZE_FRAME_PIDS.find((p) => p.pid === pid);
      if (!def) continue;

      const value = parsePIDValue(def, dataBytes);
      readings.push({
        pid: def.pid,
        service: def.service,
        name: def.name,
        value,
        unit: def.unit,
        rawBytes: dataBytes.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase(),
        timestamp,
        valid: true,
      });
    }

    return { dtc: dtcCode, frameNumber, readings, timestamp };
  }

  /**
   * Serialize a FreezeFrameData back to a hex string representation
   */
  serialize(data: FreezeFrameData): string {
    const parts: string[] = [];

    // Encode DTC
    const dtc = data.dtc;
    const category = ['P', 'C', 'B', 'U'].indexOf(dtc[0]);
    const digit1 = parseInt(dtc[1], 10);
    const digit2 = parseInt(dtc[2], 16);
    const digit3 = parseInt(dtc[3], 16);
    const digit4 = parseInt(dtc[4], 16);
    const byte0 = ((category & 0x03) << 6) | ((digit1 & 0x03) << 4) | (digit2 & 0x0F);
    const byte1 = ((digit3 & 0x0F) << 4) | (digit4 & 0x0F);
    parts.push(byte0.toString(16).padStart(2, '0'));
    parts.push(byte1.toString(16).padStart(2, '0'));
    parts.push(data.frameNumber.toString(16).padStart(2, '0'));

    for (const reading of data.readings) {
      const rawBytes = reading.rawBytes.match(/.{2}/g) ?? [];
      parts.push(reading.pid.toString(16).padStart(2, '0'));
      parts.push(rawBytes.length.toString(16).padStart(2, '0'));
      parts.push(...rawBytes.map((b) => b.toLowerCase()));
    }

    return parts.join('').toUpperCase();
  }
}
