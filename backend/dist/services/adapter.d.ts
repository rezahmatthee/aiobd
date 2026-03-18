import { BaseAdapter } from '../core/hardware/adapter';
import { ProtocolType } from '../types/protocol';
export declare class AdapterService {
    private adapters;
    connectAdapter(vehicleId: string, port: string): Promise<void>;
    disconnectAdapter(vehicleId: string): Promise<void>;
    detectProtocol(vehicleId: string): Promise<ProtocolType>;
    getAdapter(vehicleId: string): BaseAdapter | undefined;
    isConnected(vehicleId: string): boolean;
}
export declare const adapterService: AdapterService;
//# sourceMappingURL=adapter.d.ts.map