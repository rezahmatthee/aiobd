import { ELM327Adapter } from '../core/hardware/elm327';
import { BaseAdapter } from '../core/hardware/adapter';
import { ProtocolType } from '../types/protocol';
import { logger } from '../utils/logger';

export class AdapterService {
  private adapters: Map<string, BaseAdapter> = new Map();

  async connectAdapter(vehicleId: string, port: string): Promise<void> {
    const adapter = new ELM327Adapter();
    await adapter.connect(port);
    this.adapters.set(vehicleId, adapter);
    logger.info(`Adapter connected for vehicle ${vehicleId} on port ${port}`);
  }

  async disconnectAdapter(vehicleId: string): Promise<void> {
    const adapter = this.adapters.get(vehicleId);
    if (adapter) {
      await adapter.disconnect();
      this.adapters.delete(vehicleId);
    }
  }

  async detectProtocol(vehicleId: string): Promise<ProtocolType> {
    const adapter = this.adapters.get(vehicleId);
    if (!adapter) throw new Error('No adapter connected');
    return adapter.detectProtocol();
  }

  getAdapter(vehicleId: string): BaseAdapter | undefined {
    return this.adapters.get(vehicleId);
  }

  isConnected(vehicleId: string): boolean {
    const adapter = this.adapters.get(vehicleId);
    return adapter?.isConnected() ?? false;
  }
}

export const adapterService = new AdapterService();
