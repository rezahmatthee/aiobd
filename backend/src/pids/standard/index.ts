export * from './modes';
export * from './engine';
export * from './emissions';
export * from './fuel';

import { PIDDefinition } from '../../types/pid';
import { ENGINE_PIDS } from './engine';
import { EMISSION_PIDS } from './emissions';
import { FUEL_PIDS } from './fuel';

export const ALL_STANDARD_PIDS: PIDDefinition[] = [
  ...ENGINE_PIDS,
  ...EMISSION_PIDS,
  ...FUEL_PIDS,
];

export function findPID(mode: number, pid: number): PIDDefinition | undefined {
  return ALL_STANDARD_PIDS.find((p) => p.mode === mode && p.pid === pid);
}
