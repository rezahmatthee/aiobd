export * from './modes';
export * from './engine';
export * from './emissions';
export * from './fuel';
import { PIDDefinition } from '../../types/pid';
export declare const ALL_STANDARD_PIDS: PIDDefinition[];
export declare function findPID(mode: number, pid: number): PIDDefinition | undefined;
//# sourceMappingURL=index.d.ts.map