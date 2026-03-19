export * from './ford';
export * from './gm';
export * from './toyota';
export * from './vw';
export * from './bmw';
export * from './ford_extended';
export * from './gm_extended';
export * from './toyota_extended';
export * from './vw_extended';
export * from './bmw_extended';

import { ManufacturerPID } from './ford';
import { FORD_PIDS } from './ford';
import { GM_PIDS } from './gm';
import { TOYOTA_PIDS } from './toyota';
import { VW_PIDS } from './vw';
import { BMW_PIDS } from './bmw';
import { FORD_EXTENDED_PIDS } from './ford_extended';
import { GM_EXTENDED_PIDS } from './gm_extended';
import { TOYOTA_EXTENDED_PIDS } from './toyota_extended';
import { VW_EXTENDED_PIDS } from './vw_extended';
import { BMW_EXTENDED_PIDS } from './bmw_extended';

/** All manufacturer PIDs combined */
export const ALL_MANUFACTURER_PIDS: ManufacturerPID[] = [
  ...FORD_PIDS,
  ...GM_PIDS,
  ...TOYOTA_PIDS,
  ...VW_PIDS,
  ...BMW_PIDS,
  ...FORD_EXTENDED_PIDS,
  ...GM_EXTENDED_PIDS,
  ...TOYOTA_EXTENDED_PIDS,
  ...VW_EXTENDED_PIDS,
  ...BMW_EXTENDED_PIDS,
];

/** Get all PIDs for a specific manufacturer */
export function getManufacturerPIDs(manufacturer: string): ManufacturerPID[] {
  return ALL_MANUFACTURER_PIDS.filter(
    (p) => p.manufacturer.toLowerCase() === manufacturer.toLowerCase(),
  );
}
