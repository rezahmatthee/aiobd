import { ProtocolType, ProtocolConfig } from '../../types/protocol';
import { BaseAdapter, AdapterInfo } from './adapter';
export declare class ELM327Adapter extends BaseAdapter {
    readonly name = "ELM327";
    private port;
    connect(port: string, _config?: ProtocolConfig): Promise<void>;
    disconnect(): Promise<void>;
    sendCommand(command: string): Promise<string>;
    getAdapterInfo(): Promise<AdapterInfo>;
    detectProtocol(): Promise<ProtocolType>;
}
//# sourceMappingURL=elm327.d.ts.map