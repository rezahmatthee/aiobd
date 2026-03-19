export * from './standard';
export * from './advanced/mode_06';
export * from './advanced/mode_09';
export * from './advanced/freeze_frames';
export * from './manufacturer';

import { PIDDefinition } from '../types';
import { ALL_STANDARD_PIDS } from './standard';
import { ALL_MANUFACTURER_PIDS } from './manufacturer';

/** Complete PID library: standard + manufacturer */
export const ALL_PIDS: PIDDefinition[] = [
  ...ALL_STANDARD_PIDS,
  ...ALL_MANUFACTURER_PIDS,
];

/** Look up any PID definition by PID number */
export function findAnyPID(pid: number): PIDDefinition | undefined {
  return ALL_PIDS.find((p) => p.pid === pid);
}
