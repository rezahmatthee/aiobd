export * from './protocols/base';
export * from './protocols/sae_j1850_pwm';
export * from './protocols/sae_j1850_vpw';
export * from './protocols/iso_9141_2';
export * from './protocols/iso_14230';
export * from './protocols/iso_15765';
export * from './protocols/iso_27145';
export * from './hardware/adapter';
export * from './hardware/elm327';
import { ProtocolType } from '../types/protocol';
import { BaseProtocol } from './protocols/base';
export declare function createProtocol(type: ProtocolType): BaseProtocol;
//# sourceMappingURL=index.d.ts.map