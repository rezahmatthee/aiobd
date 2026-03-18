export * from './standard';
export * from './advanced/mode_06';
export * from './advanced/mode_09';
export * from './advanced/freeze_frames';
export * from './manufacturer';
import { PIDDefinition } from '../types/pid';
import { ALL_STANDARD_PIDS } from './standard';
export { ALL_STANDARD_PIDS };
export declare function findPIDByName(name: string): PIDDefinition | undefined;
export declare function findManufacturerPID(manufacturer: string, mode: number, pid: number): PIDDefinition | undefined;
//# sourceMappingURL=index.d.ts.map