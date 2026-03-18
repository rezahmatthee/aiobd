export * from './ford';
export * from './gm';
export * from './toyota';
export * from './vw';
export * from './bmw';

import { PIDDefinition } from '../../types/pid';
import { FORD_PIDS } from './ford';
import { GM_PIDS } from './gm';
import { TOYOTA_PIDS } from './toyota';
import { VW_PIDS } from './vw';
import { BMW_PIDS } from './bmw';

export const MANUFACTURER_PIDS: Record<string, PIDDefinition[]> = {
  FORD: FORD_PIDS,
  GM: GM_PIDS,
  TOYOTA: TOYOTA_PIDS,
  VW: VW_PIDS,
  BMW: BMW_PIDS,
};

export function getManufacturerPIDs(manufacturer: string): PIDDefinition[] {
  return MANUFACTURER_PIDS[manufacturer.toUpperCase()] || [];
}
