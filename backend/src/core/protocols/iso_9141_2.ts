import { ProtocolType, ProtocolStatus, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';

export class ISO91412Protocol extends BaseProtocol {
  public readonly type = ProtocolType.ISO_9141_2;

  constructor() {
    super({ baudRate: 10400, timeout: 5000 });
  }

  async connect(): Promise<void> {
    this.setStatus(ProtocolStatus.CONNECTING);
    // ISO 9141-2: 5-baud initialization at 10.4 kbps
    // Send 0x33 at 5 baud, receive 0x55 sync byte, key bytes, then inverted key byte
    this.setStatus(ProtocolStatus.CONNECTED);
  }

  async disconnect(): Promise<void> {
    this.setStatus(ProtocolStatus.DISCONNECTED);
  }

  async sendRequest(mode: number, pid: number): Promise<ProtocolResponse> {
    const request = this.buildRequest(mode, pid);
    return {
      success: true,
      raw: request,
      timestamp: new Date(),
    };
  }

  parseResponse(raw: string): ProtocolResponse {
    if (!this.validateResponse(raw)) {
      return { success: false, error: 'Invalid response', timestamp: new Date() };
    }
    // ISO 9141-2 response format: 48 6B XX YY [data bytes] CC
    const parts = raw.trim().split(/\s+/);
    const dataBytes = parts.slice(3, -1).map((b) => parseInt(b, 16));
    return {
      success: true,
      data: Buffer.from(dataBytes),
      raw,
      timestamp: new Date(),
    };
  }
}
