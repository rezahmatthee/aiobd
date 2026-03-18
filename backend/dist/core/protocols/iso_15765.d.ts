import { ProtocolType, ProtocolConfig, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';
export declare class ISO15765Protocol extends BaseProtocol {
    readonly type = ProtocolType.ISO_15765;
    constructor(config?: ProtocolConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
    parseResponse(raw: string): ProtocolResponse;
}
//# sourceMappingURL=iso_15765.d.ts.map