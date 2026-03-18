import { ProtocolType, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';
export declare class ISO14230Protocol extends BaseProtocol {
    readonly type = ProtocolType.ISO_14230;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
    parseResponse(raw: string): ProtocolResponse;
}
//# sourceMappingURL=iso_14230.d.ts.map