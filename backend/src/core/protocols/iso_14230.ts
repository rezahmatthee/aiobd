import { ProtocolType, ProtocolStatus, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';

export class ISO14230Protocol extends BaseProtocol {
  public readonly type = ProtocolType.ISO_14230;

  constructor() {
    super({ baudRate: 10400, timeout: 5000 });
  }

  async connect(): Promise<void> {
    this.setStatus(ProtocolStatus.CONNECTING);
    // ISO 14230 (KWP2000): Fast init or 5-baud init
    // Fast init: pull K-line low for 25ms, high for 25ms
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
    // KWP2000 response: format byte, target, source, [length], service ID, data, checksum
    const parts = raw.trim().split(/\s+/);
    const dataBytes = parts.slice(4, -1).map((b) => parseInt(b, 16));
    return {
      success: true,
      data: Buffer.from(dataBytes),
      raw,
      timestamp: new Date(),
    };
  }
}
