export * from './engine';
export * from './fuel';
export * from './emissions';
export * from './modes';

import { PIDDefinition } from '../../types';
import { ENGINE_PIDS } from './engine';
import { FUEL_PIDS } from './fuel';
import { EMISSIONS_PIDS } from './emissions';

/** Combined array of all standard OBD2 PID definitions */
export const ALL_STANDARD_PIDS: PIDDefinition[] = [
  ...ENGINE_PIDS,
  ...FUEL_PIDS,
  ...EMISSIONS_PIDS,
];

/**
 * Look up a standard PID definition by its PID number and service
 */
export function findPID(pid: number, service?: number): PIDDefinition | undefined {
  return ALL_STANDARD_PIDS.find(
    (p) => p.pid === pid && (service === undefined || p.service === service),
  );
}
