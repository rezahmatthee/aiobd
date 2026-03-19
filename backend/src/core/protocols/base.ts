/**
 * Abstract base class for OBD2 communication protocols
 */
import { EventEmitter } from 'events';
import { ProtocolConfig, ProtocolResponse, ConnectionState, ProtocolEvent } from '../../types/protocol';
import { logger } from '../../utils/logger';

export abstract class BaseProtocol extends EventEmitter {
  protected config: ProtocolConfig;
  protected state: ConnectionState = ConnectionState.DISCONNECTED;
  protected responseBuffer = '';

  constructor(config: ProtocolConfig) {
    super();
    this.config = config;
  }

  get connectionState(): ConnectionState {
    return this.state;
  }

  get isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /** Establish connection to the OBD2 adapter */
  abstract connect(): Promise<void>;

  /** Disconnect from the OBD2 adapter */
  abstract disconnect(): Promise<void>;

  /** Send a raw OBD2 request and return the response */
  abstract sendRequest(request: string): Promise<ProtocolResponse>;

  /** Parse raw bytes into protocol-specific format */
  abstract parseResponse(raw: string): ProtocolResponse;

  /** Initialize the protocol (send init sequence) */
  abstract initialize(): Promise<void>;

  /** Get supported PIDs for the given service */
  async getSupportedPIDs(service: number): Promise<string> {
    const response = await this.sendRequest(`${service.toString(16).padStart(2, '0')}00`);
    return response.raw ?? '';
  }

  /** Send Mode 01 PID request */
  async readPID(pid: number): Promise<ProtocolResponse> {
    const request = `01${pid.toString(16).padStart(2, '0')}`;
    return this.sendRequest(request);
  }

  /** Request all DTCs (Mode 03) */
  async readDTCs(): Promise<ProtocolResponse> {
    return this.sendRequest('03');
  }

  /** Clear DTCs (Mode 04) */
  async clearDTCs(): Promise<ProtocolResponse> {
    return this.sendRequest('04');
  }

  /** Request pending DTCs (Mode 07) */
  async readPendingDTCs(): Promise<ProtocolResponse> {
    return this.sendRequest('07');
  }

  /** Request permanent DTCs (Mode 0A) */
  async readPermanentDTCs(): Promise<ProtocolResponse> {
    return this.sendRequest('0A');
  }

  protected setState(newState: ConnectionState): void {
    const prev = this.state;
    this.state = newState;
    logger.debug(`Protocol state: ${prev} → ${newState}`);

    if (newState === ConnectionState.CONNECTED) {
      this.emit(ProtocolEvent.CONNECTED);
    } else if (newState === ConnectionState.DISCONNECTED) {
      this.emit(ProtocolEvent.DISCONNECTED);
    } else if (newState === ConnectionState.ERROR) {
      this.emit(ProtocolEvent.ERROR);
    }
  }

  protected withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      ),
    ]);
  }
}
