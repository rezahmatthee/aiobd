/**
 * SAE J1850 VPW protocol implementation (10.4 kbaud variable pulse width)
 * Single-wire bus used by older GM vehicles (Class 2 bus).
 * VPW: 1-bit = 128µs high, 0-bit = 64µs high on single wire.
 * This is a simulation implementation for testability without real hardware.
 */
import { BaseProtocol } from './base';
import { ProtocolConfig, ProtocolResponse, ConnectionState } from '../../types/protocol';
import { logger } from '../../utils/logger';
import { isErrorResponse, cleanResponse } from '../../utils/obd_parser';

export class SAEJ1850VPWProtocol extends BaseProtocol {
  private static readonly BAUD_RATE = 10400;
  /** VPW SOF (Start of Frame) high pulse: 200µs */
  private static readonly SOF_HIGH_US = 200;
  /** J1850 VPW priority for OBD2 functional addressing */
  private static readonly PRIORITY_BYTE = 0x68;
  private static readonly TARGET_ADDR = 0x6A;
  private static readonly SOURCE_ADDR = 0xF1;

  constructor(config: ProtocolConfig) {
    super({ ...config, baudRate: SAEJ1850VPWProtocol.BAUD_RATE });
  }

  async connect(): Promise<void> {
    this.setState(ConnectionState.CONNECTING);
    logger.debug(`SAE J1850 VPW: waiting for bus idle (SOF=${SAEJ1850VPWProtocol.SOF_HIGH_US}µs)`);
    await this.simulateDelay(60);
    this.setState(ConnectionState.CONNECTED);
    logger.info('SAE J1850 VPW: connected');
  }

  async disconnect(): Promise<void> {
    this.setState(ConnectionState.DISCONNECTED);
    logger.info('SAE J1850 VPW: disconnected');
  }

  async initialize(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    // VPW requires waiting for IFR (In-Frame Response) window
    await this.simulateDelay(150);
    logger.info('SAE J1850 VPW: initialization complete');
  }

  async sendRequest(request: string): Promise<ProtocolResponse> {
    if (!this.isConnected) {
      return this.errorResponse('Not connected');
    }

    const start = Date.now();
    logger.debug(`SAE J1850 VPW TX: ${request}`);

    const frame = this.buildFrame(request);
    const raw = await this.simulateEcuResponse(frame);
    const responseTime = Date.now() - start;

    if (isErrorResponse(raw)) {
      return this.errorResponse(raw, responseTime);
    }

    return this.parseResponse(raw, responseTime);
  }

  parseResponse(raw: string, responseTime = 0): ProtocolResponse {
    const cleaned = cleanResponse(raw);
    return {
      success: true,
      raw: cleaned,
      data: Buffer.from(cleaned.replace(/\s/g, ''), 'hex'),
      timestamp: new Date(),
      responseTime,
    };
  }

  /** Build a J1850 VPW frame with 3-byte header and CRC */
  private buildFrame(data: string): string {
    const header = [
      SAEJ1850VPWProtocol.PRIORITY_BYTE,
      SAEJ1850VPWProtocol.TARGET_ADDR,
      SAEJ1850VPWProtocol.SOURCE_ADDR,
    ];
    const dataBytes = data.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) ?? [];
    const payload = [...header, ...dataBytes];
    const crc = this.calculateCRC(payload);
    return [...payload, crc].map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
  }

  /** J1850 CRC-8 with polynomial 0x1D */
  private calculateCRC(data: number[]): number {
    let crc = 0xFF;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = (crc & 0x80) ? ((crc << 1) ^ 0x1D) & 0xFF : (crc << 1) & 0xFF;
      }
    }
    return crc ^ 0xFF;
  }

  /** Simulate ECU response */
  private async simulateEcuResponse(frame: string): Promise<string> {
    await this.simulateDelay(25);
    const parts = frame.split(' ');
    const service = parts[3] ?? '01';
    const pid = parts[4] ?? '00';
    const responseService = (parseInt(service, 16) + 0x40).toString(16).toUpperCase().padStart(2, '0');
    return `48 6B 10 ${responseService} ${pid} 00 00 00 00`;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private errorResponse(error: string, responseTime = 0): ProtocolResponse {
    return { success: false, error, timestamp: new Date(), responseTime };
  }
}
