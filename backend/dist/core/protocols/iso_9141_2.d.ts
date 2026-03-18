import { ProtocolType, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';
export declare class ISO91412Protocol extends BaseProtocol {
    readonly type = ProtocolType.ISO_9141_2;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
    parseResponse(raw: string): ProtocolResponse;
}
//# sourceMappingURL=iso_9141_2.d.ts.map