import { ProtocolType, ProtocolConfig } from '../../types/protocol';
export declare enum AdapterStatus {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    ERROR = "ERROR"
}
export interface AdapterInfo {
    name: string;
    version: string;
    supportedProtocols: ProtocolType[];
}
export declare abstract class BaseAdapter {
    status: AdapterStatus;
    abstract readonly name: string;
    abstract connect(port: string, config?: ProtocolConfig): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract sendCommand(command: string): Promise<string>;
    abstract getAdapterInfo(): Promise<AdapterInfo>;
    abstract detectProtocol(): Promise<ProtocolType>;
    isConnected(): boolean;
    protected setStatus(status: AdapterStatus): void;
    protected delay(ms: number): Promise<void>;
}
//# sourceMappingURL=adapter.d.ts.map