import { ProtocolType, ProtocolConfig } from '../../types/protocol';
import { logger } from '../../utils/logger';

export enum AdapterStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface AdapterInfo {
  name: string;
  version: string;
  supportedProtocols: ProtocolType[];
}

export abstract class BaseAdapter {
  public status: AdapterStatus = AdapterStatus.DISCONNECTED;
  public abstract readonly name: string;

  abstract connect(port: string, config?: ProtocolConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sendCommand(command: string): Promise<string>;
  abstract getAdapterInfo(): Promise<AdapterInfo>;
  abstract detectProtocol(): Promise<ProtocolType>;

  isConnected(): boolean {
    return this.status === AdapterStatus.CONNECTED;
  }

  protected setStatus(status: AdapterStatus): void {
    this.status = status;
    logger.debug(`Adapter ${this.name} status changed to ${status}`);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
