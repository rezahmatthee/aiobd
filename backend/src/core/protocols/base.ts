import {
  IProtocol,
  ProtocolType,
  ProtocolStatus,
  ProtocolConfig,
  ProtocolResponse,
  ProtocolFrame,
} from '../../types/protocol';
import { logger } from '../../utils/logger';

export abstract class BaseProtocol implements IProtocol {
  public abstract readonly type: ProtocolType;
  public status: ProtocolStatus = ProtocolStatus.DISCONNECTED;
  public config: ProtocolConfig;

  constructor(config: ProtocolConfig = {}) {
    this.config = {
      baudRate: 9600,
      timeout: 5000,
      retries: 3,
      headerEnabled: false,
      ...config,
    };
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
  abstract parseResponse(raw: string): ProtocolResponse;

  isConnected(): boolean {
    return this.status === ProtocolStatus.CONNECTED;
  }

  protected buildRequest(mode: number, pid: number): string {
    return `${mode.toString(16).padStart(2, '0').toUpperCase()}${pid.toString(16).padStart(2, '0').toUpperCase()}`;
  }

  protected validateResponse(raw: string): boolean {
    if (!raw || raw.trim() === '') return false;
    const errorResponses = ['NO DATA', 'ERROR', 'UNABLE TO CONNECT', 'BUS BUSY', '?'];
    return !errorResponses.some((err) => raw.toUpperCase().includes(err));
  }

  protected hexToBytes(hex: string): number[] {
    const clean = hex.replace(/\s+/g, '');
    const bytes: number[] = [];
    for (let i = 0; i < clean.length; i += 2) {
      bytes.push(parseInt(clean.substring(i, i + 2), 16));
    }
    return bytes;
  }

  protected setStatus(status: ProtocolStatus): void {
    this.status = status;
    logger.debug(`Protocol ${this.type} status changed to ${status}`);
  }

  protected buildFrame(mode: number, pid: number): ProtocolFrame {
    const data = Buffer.from([mode, pid]);
    return {
      header: Buffer.alloc(0),
      data,
      raw: data,
    };
  }
}
