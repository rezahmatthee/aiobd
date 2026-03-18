export * from './standard';
export * from './advanced/mode_06';
export * from './advanced/mode_09';
export * from './advanced/freeze_frames';
export * from './manufacturer';

import { PIDDefinition } from '../types/pid';
import { ALL_STANDARD_PIDS, findPID as findStandardPID } from './standard';
import { getManufacturerPIDs } from './manufacturer';

export { ALL_STANDARD_PIDS };

export function findPIDByName(name: string): PIDDefinition | undefined {
  return ALL_STANDARD_PIDS.find((p) => p.name === name);
}

export function findManufacturerPID(manufacturer: string, mode: number, pid: number): PIDDefinition | undefined {
  const pids = getManufacturerPIDs(manufacturer);
  return pids.find((p) => p.mode === mode && p.pid === pid);
}
