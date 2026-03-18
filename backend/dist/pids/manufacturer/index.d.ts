export * from './ford';
export * from './gm';
export * from './toyota';
export * from './vw';
export * from './bmw';
import { PIDDefinition } from '../../types/pid';
export declare const MANUFACTURER_PIDS: Record<string, PIDDefinition[]>;
export declare function getManufacturerPIDs(manufacturer: string): PIDDefinition[];
//# sourceMappingURL=index.d.ts.map