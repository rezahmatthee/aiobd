/**
 * Abstract base class for OBD2 hardware adapters
 */
import { EventEmitter } from 'events';
import { ProtocolType } from '../../types/protocol';
import { logger } from '../../utils/logger';

export interface AdapterInfo {
  name: string;
  version: string;
  voltage: number;
  protocol: ProtocolType;
}

export interface AdapterConfig {
  port: string;
  baudRate: number;
  timeout: number;
  autoDetectProtocol: boolean;
}

export abstract class BaseAdapter extends EventEmitter {
  protected config: AdapterConfig;
  protected connected = false;

  constructor(config: AdapterConfig) {
    super();
    this.config = config;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  abstract open(): Promise<void>;
  abstract close(): Promise<void>;
  abstract sendCommand(command: string): Promise<string>;
  abstract getAdapterInfo(): Promise<AdapterInfo>;
  abstract setProtocol(protocol: ProtocolType): Promise<void>;
  abstract resetAdapter(): Promise<void>;

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>): void {
    logger[level](`[${this.constructor.name}] ${message}`, meta ?? {});
  }
}
