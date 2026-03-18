import { IProtocol, ProtocolType, ProtocolStatus, ProtocolConfig, ProtocolResponse, ProtocolFrame } from '../../types/protocol';
export declare abstract class BaseProtocol implements IProtocol {
    abstract readonly type: ProtocolType;
    status: ProtocolStatus;
    config: ProtocolConfig;
    constructor(config?: ProtocolConfig);
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
    abstract parseResponse(raw: string): ProtocolResponse;
    isConnected(): boolean;
    protected buildRequest(mode: number, pid: number): string;
    protected validateResponse(raw: string): boolean;
    protected hexToBytes(hex: string): number[];
    protected setStatus(status: ProtocolStatus): void;
    protected buildFrame(mode: number, pid: number): ProtocolFrame;
}
//# sourceMappingURL=base.d.ts.map