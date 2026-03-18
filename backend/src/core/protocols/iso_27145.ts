import { ProtocolType, ProtocolStatus, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';

export class ISO27145Protocol extends BaseProtocol {
  public readonly type = ProtocolType.ISO_27145;

  constructor() {
    super({ baudRate: 500000, timeout: 5000, headerEnabled: true });
  }

  async connect(): Promise<void> {
    this.setStatus(ProtocolStatus.CONNECTING);
    // ISO 27145 (WWH-OBD): World Wide Harmonized OBD
    // Built on ISO 15765-4 CAN and ISO 14229 UDS
    this.setStatus(ProtocolStatus.CONNECTED);
  }

  async disconnect(): Promise<void> {
    this.setStatus(ProtocolStatus.DISCONNECTED);
  }

  async sendRequest(mode: number, pid: number): Promise<ProtocolResponse> {
    // WWH-OBD uses UDS service 0x22 ReadDataByIdentifier
    const request = `22 ${pid.toString(16).padStart(4, '0').toUpperCase()}`;
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
    const parts = raw.trim().split(/\s+/);
    // UDS positive response: 62 [identifier high] [identifier low] [data bytes]
    const dataBytes = parts.slice(3).map((b) => parseInt(b, 16));
    return {
      success: true,
      data: Buffer.from(dataBytes),
      raw,
      timestamp: new Date(),
    };
  }
}
