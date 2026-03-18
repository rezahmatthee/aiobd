import { ProtocolType, ProtocolStatus, ProtocolConfig, ProtocolResponse } from '../../types/protocol';
import { BaseProtocol } from './base';

export class ISO15765Protocol extends BaseProtocol {
  public readonly type = ProtocolType.ISO_15765;

  constructor(config: ProtocolConfig = {}) {
    super({
      baudRate: 500000,
      timeout: 5000,
      headerEnabled: true,
      canId: 0x7DF,
      ...config,
    });
  }

  async connect(): Promise<void> {
    this.setStatus(ProtocolStatus.CONNECTING);
    // ISO 15765 CAN bus: 500 kbps (or 250 kbps for older vehicles)
    // Uses 11-bit or 29-bit CAN identifiers
    this.setStatus(ProtocolStatus.CONNECTED);
  }

  async disconnect(): Promise<void> {
    this.setStatus(ProtocolStatus.DISCONNECTED);
  }

  async sendRequest(mode: number, pid: number): Promise<ProtocolResponse> {
    // CAN frame: 7DF 02 01 XX 00 00 00 00
    const canFrame = `${(this.config.canId || 0x7DF).toString(16).toUpperCase().padStart(3, '0')} 02 ${mode.toString(16).padStart(2, '0').toUpperCase()} ${pid.toString(16).padStart(2, '0').toUpperCase()} 00 00 00 00`;
    return {
      success: true,
      raw: canFrame,
      timestamp: new Date(),
    };
  }

  parseResponse(raw: string): ProtocolResponse {
    if (!this.validateResponse(raw)) {
      return { success: false, error: 'Invalid response', timestamp: new Date() };
    }
    // CAN response: 7E8 04 41 XX [data bytes] 00 00 00
    const parts = raw.trim().split(/\s+/);
    const dataLength = parseInt(parts[1], 16);
    const dataBytes = parts.slice(4, 4 + dataLength - 2).map((b) => parseInt(b, 16));
    return {
      success: true,
      data: Buffer.from(dataBytes),
      raw,
      timestamp: new Date(),
    };
  }
}
