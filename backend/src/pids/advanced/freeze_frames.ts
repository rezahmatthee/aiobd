/**
 * Freeze Frame - Vehicle State Snapshot at Fault Detection
 * Captures OBD2 data at the moment a DTC is stored
 */

export interface FreezeFramePID {
  pid: number;
  name: string;
  value: number | string;
  unit: string;
  rawBytes: number[];
}

export interface FreezeFrame {
  frameId: string;
  vehicleId: string;
  dtc: string;
  timestamp: Date;
  pids: FreezeFramePID[];
  rawData: number[];
}

// Standard PIDs that may appear in a freeze frame
export const FREEZE_FRAME_PIDS: Record<number, { name: string; unit: string; formula: (bytes: number[]) => number | string }> = {
  0x04: {
    name: 'Calculated Engine Load',
    unit: '%',
    formula: (bytes) => (bytes[0] * 100) / 255,
  },
  0x05: {
    name: 'Engine Coolant Temperature',
    unit: '°C',
    formula: (bytes) => bytes[0] - 40,
  },
  0x0B: {
    name: 'Intake Manifold Absolute Pressure',
    unit: 'kPa',
    formula: (bytes) => bytes[0],
  },
  0x0C: {
    name: 'Engine RPM',
    unit: 'RPM',
    formula: (bytes) => ((bytes[0] << 8) | bytes[1]) / 4,
  },
  0x0D: {
    name: 'Vehicle Speed',
    unit: 'km/h',
    formula: (bytes) => bytes[0],
  },
  0x0E: {
    name: 'Timing Advance',
    unit: '° before TDC',
    formula: (bytes) => bytes[0] / 2 - 64,
  },
  0x0F: {
    name: 'Intake Air Temperature',
    unit: '°C',
    formula: (bytes) => bytes[0] - 40,
  },
  0x10: {
    name: 'Mass Air Flow Rate',
    unit: 'g/s',
    formula: (bytes) => ((bytes[0] << 8) | bytes[1]) / 100,
  },
  0x11: {
    name: 'Throttle Position',
    unit: '%',
    formula: (bytes) => (bytes[0] * 100) / 255,
  },
};

/**
 * Parse a freeze frame DTC from 2 bytes
 * Format matches standard DTC encoding
 */
export function parseFreezeFrameDTC(highByte: number, lowByte: number): string {
  const systemBits = (highByte >> 6) & 0x03;
  const systems = ['P', 'C', 'B', 'U'];
  const system = systems[systemBits];
  const digit1 = (highByte >> 4) & 0x03;
  const digit2 = highByte & 0x0F;
  const digit3 = (lowByte >> 4) & 0x0F;
  const digit4 = lowByte & 0x0F;
  return `${system}${digit1.toString(16).toUpperCase()}${digit2.toString(16).toUpperCase()}${digit3.toString(16).toUpperCase()}${digit4.toString(16).toUpperCase()}`;
}

/**
 * Parse freeze frame PID data
 */
export function parseFreezeFramePID(pid: number, bytes: number[]): FreezeFramePID | null {
  const pidDef = FREEZE_FRAME_PIDS[pid];
  if (!pidDef) {
    return null;
  }

  return {
    pid,
    name: pidDef.name,
    value: pidDef.formula(bytes),
    unit: pidDef.unit,
    rawBytes: bytes,
  };
}

/**
 * Parse a complete freeze frame response
 * Freeze frame response format:
 * [DTC High][DTC Low][PID1][Data...][PID2][Data...]...
 */
export function parseFreezeFrameResponse(vehicleId: string, frameId: string, rawBytes: number[]): FreezeFrame | null {
  if (rawBytes.length < 3) {
    return null;
  }

  const dtc = parseFreezeFrameDTC(rawBytes[0], rawBytes[1]);
  const pids: FreezeFramePID[] = [];

  let i = 2;
  while (i < rawBytes.length) {
    const pid = rawBytes[i];
    i++;

    // Determine data length for this PID (simplified: assume 2 bytes)
    const dataLength = getPIDDataLength(pid);
    if (i + dataLength > rawBytes.length) break;

    const pidBytes = rawBytes.slice(i, i + dataLength);
    const parsedPID = parseFreezeFramePID(pid, pidBytes);
    if (parsedPID) {
      pids.push(parsedPID);
    }
    i += dataLength;
  }

  return {
    frameId,
    vehicleId,
    dtc,
    timestamp: new Date(),
    pids,
    rawData: rawBytes,
  };
}

function getPIDDataLength(pid: number): number {
  // Standard data lengths per SAE J1979
  const twoBytesPIDs = [0x0C, 0x10, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B];
  if (twoBytesPIDs.includes(pid)) return 2;
  return 1;
}

/**
 * Build Mode $02 (freeze frame) request bytes
 * @param pid - PID to request in freeze frame context
 * @param frameNumber - Frame number (usually 0)
 */
export function buildFreezeFrameRequest(pid: number, frameNumber = 0): number[] {
  return [0x02, pid, frameNumber];
}
