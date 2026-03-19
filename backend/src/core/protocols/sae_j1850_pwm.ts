/**
 * SAE J1850 PWM protocol implementation (10.4 kbaud differential signaling)
 * Used by Ford vehicles. Header format: [priority/type][target][source] + CRC.
 * This is a simulation implementation for testability without real hardware.
 */
import { BaseProtocol } from './base';
import { ProtocolConfig, ProtocolResponse, ConnectionState } from '../../types/protocol';
import { logger } from '../../utils/logger';
import { isErrorResponse, cleanResponse } from '../../utils/obd_parser';

export class SAEJ1850PWMProtocol extends BaseProtocol {
  /** J1850 PWM bit timing: 1 = 64µs high, 0 = 128µs high */
  private static readonly BAUD_RATE = 10400;
  /** Priority byte for OBD2 requests (functional addressing) */
  private static readonly PRIORITY_BYTE = 0x68;
  /** OBD2 functional target address */
  private static readonly TARGET_ADDR = 0x6A;
  /** Tester source address */
  private static readonly SOURCE_ADDR = 0xF1;

  constructor(config: ProtocolConfig) {
    super({ ...config, baudRate: SAEJ1850PWMProtocol.BAUD_RATE });
  }

  async connect(): Promise<void> {
    this.setState(ConnectionState.CONNECTING);
    logger.debug('SAE J1850 PWM: initiating bus connection');
    await this.simulateDelay(50);
    this.setState(ConnectionState.CONNECTED);
    logger.info('SAE J1850 PWM: connected');
  }

  async disconnect(): Promise<void> {
    this.setState(ConnectionState.DISCONNECTED);
    logger.info('SAE J1850 PWM: disconnected');
  }

  async initialize(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    logger.debug('SAE J1850 PWM: initializing bus arbitration');
    // J1850 PWM uses bus idle detection before transmitting
    await this.simulateDelay(100);
    logger.info('SAE J1850 PWM: initialization complete');
  }

  async sendRequest(request: string): Promise<ProtocolResponse> {
    if (!this.isConnected) {
      return this.errorResponse('Not connected');
    }

    const start = Date.now();
    logger.debug(`SAE J1850 PWM TX: ${request}`);

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

  /** Build a J1850 PWM frame with header bytes and CRC */
  private buildFrame(data: string): string {
    const header = [
      SAEJ1850PWMProtocol.PRIORITY_BYTE,
      SAEJ1850PWMProtocol.TARGET_ADDR,
      SAEJ1850PWMProtocol.SOURCE_ADDR,
    ];
    const dataBytes = data.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) ?? [];
    const payload = [...header, ...dataBytes];
    const crc = this.calculateCRC(payload);
    return [...payload, crc].map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
  }

  /** J1850 CRC-8 calculation */
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

  /** Simulate ECU response for testing */
  private async simulateEcuResponse(frame: string): Promise<string> {
    await this.simulateDelay(this.config.timeout > 0 ? 20 : 0);
    const service = frame.split(' ')[3] ?? '01';
    const pid = frame.split(' ')[4] ?? '00';
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
