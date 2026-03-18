import { ProtocolType, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';
export declare class ISO27145Protocol extends BaseProtocol {
    readonly type = ProtocolType.ISO_27145;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
    parseResponse(raw: string): ProtocolResponse;
}
//# sourceMappingURL=iso_27145.d.ts.map