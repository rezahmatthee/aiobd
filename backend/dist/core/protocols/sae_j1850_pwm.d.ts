import { ProtocolType, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';
export declare class SAEJ1850PWMProtocol extends BaseProtocol {
    readonly type = ProtocolType.SAE_J1850_PWM;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
    parseResponse(raw: string): ProtocolResponse;
}
//# sourceMappingURL=sae_j1850_pwm.d.ts.map