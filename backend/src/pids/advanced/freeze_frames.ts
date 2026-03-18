import { PIDValue } from '../../types/pid';
import { FreezeFrame } from '../../types/diagnostic';
import { findPID } from '../standard';

export function parseFreezeFrame(dtcCode: string, rawResponses: Record<number, string>): FreezeFrame {
  const pidValues: PIDValue[] = [];
  for (const [pidHex, raw] of Object.entries(rawResponses)) {
    const pid = parseInt(pidHex);
    const pidDef = findPID(0x02, pid);
    if (pidDef) {
      const parts = raw.trim().split(/\s+/);
      const dataBytes = parts.slice(2).map((b) => parseInt(b, 16));
      pidValues.push({
        pid: pidDef,
        rawValue: dataBytes,
        calculatedValue: pidDef.formula(dataBytes),
        unit: pidDef.unit,
        timestamp: new Date(),
      });
    }
  }
  return {
    dtcCode,
    pidValues,
    timestamp: new Date(),
  };
}

export const FREEZE_FRAME_PIDS = [0x02, 0x04, 0x05, 0x06, 0x07, 0x0C, 0x0D, 0x0F, 0x10, 0x11] as const;
