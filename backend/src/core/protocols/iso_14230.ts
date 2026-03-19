/**
 * ISO 14230 KWP2000 (Keyword Protocol 2000) implementation.
 * Supports both 5-baud and fast initialization on K-line at 10.4 kbaud.
 * KWP2000 adds length byte and service ID structure over ISO 9141-2.
 * Header: [format][target][source][length] or [format+length].
 * This is a simulation implementation for testability without real hardware.
 */
import { BaseProtocol } from './base';
import { ProtocolConfig, ProtocolResponse, ConnectionState, ProtocolType } from '../../types/protocol';
import { logger } from '../../utils/logger';
import { isErrorResponse, cleanResponse } from '../../utils/obd_parser';

export class ISO14230Protocol extends BaseProtocol {
  private static readonly BAUD_RATE = 10400;
  /** KWP2000 fast init wakeup pattern: 25ms low, 25ms high */
  private static readonly FAST_INIT_LOW_MS = 25;
  private static readonly FAST_INIT_HIGH_MS = 25;
  /** Functional addressing for OBD2 */
  private static readonly TARGET_ADDR = 0x33;
  private static readonly SOURCE_ADDR = 0xF1;
  /** KWP2000 format byte: physical addressing, no length in format byte */
  private static readonly FORMAT_BYTE = 0x80;

  private readonly useFastInit: boolean;

  constructor(config: ProtocolConfig) {
    super({ ...config, baudRate: ISO14230Protocol.BAUD_RATE });
    this.useFastInit = config.type === ProtocolType.ISO_14230_4_KWP_FAST;
  }

  async connect(): Promise<void> {
    this.setState(ConnectionState.CONNECTING);
    if (this.useFastInit) {
      await this.performFastInit();
    } else {
      await this.performFiveBaudInit();
    }
    this.setState(ConnectionState.CONNECTED);
    logger.info(`ISO 14230 KWP2000: connected via ${this.useFastInit ? 'fast' : '5-baud'} init`);
  }

  async disconnect(): Promise<void> {
    this.setState(ConnectionState.DISCONNECTED);
    logger.info('ISO 14230 KWP2000: disconnected');
  }

  async initialize(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    logger.info('ISO 14230 KWP2000: protocol initialization complete');
  }

  async sendRequest(request: string): Promise<ProtocolResponse> {
    if (!this.isConnected) {
      return this.errorResponse('Not connected');
    }

    const start = Date.now();
    const frame = this.buildKWPFrame(request);
    logger.debug(`ISO 14230 TX: ${frame}`);

    const raw = await this.simulateEcuResponse(request);
    const responseTime = Date.now() - start;

    if (isErrorResponse(raw)) {
      return this.errorResponse(raw, responseTime);
    }

    return this.parseResponse(raw, responseTime);
  }

  parseResponse(raw: string, responseTime = 0): ProtocolResponse {
    const cleaned = cleanResponse(raw);
    // Strip KWP2000 header bytes if present (format, target, source, length)
    const dataStart = cleaned.startsWith('C0') || cleaned.startsWith('80') ? 8 : 0;
    const payload = cleaned.slice(dataStart).trim();
    return {
      success: true,
      raw: payload || cleaned,
      data: Buffer.from((payload || cleaned).replace(/\s/g, ''), 'hex'),
      timestamp: new Date(),
      responseTime,
    };
  }

  /**
   * Build KWP2000 frame: [FORMAT][TARGET][SOURCE][LEN][DATA...][CHECKSUM]
   * Format 0x80 = physical addressing with separate length byte.
   */
  private buildKWPFrame(data: string): string {
    const dataBytes = data.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) ?? [];
    const len = dataBytes.length;
    const frame = [
      ISO14230Protocol.FORMAT_BYTE,
      ISO14230Protocol.TARGET_ADDR,
      ISO14230Protocol.SOURCE_ADDR,
      len,
      ...dataBytes,
    ];
    const checksum = frame.reduce((sum, b) => (sum + b) & 0xFF, 0);
    return [...frame, checksum].map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
  }

  /**
   * KWP2000 fast initialization: 25ms low pulse followed by 25ms high,
   * then send start communication request.
   */
  private async performFastInit(): Promise<void> {
    logger.debug(`ISO 14230: fast init - ${ISO14230Protocol.FAST_INIT_LOW_MS}ms low / ${ISO14230Protocol.FAST_INIT_HIGH_MS}ms high`);
    await this.simulateDelay(ISO14230Protocol.FAST_INIT_LOW_MS + ISO14230Protocol.FAST_INIT_HIGH_MS);
    logger.debug('ISO 14230: sending StartCommunication request');
    await this.simulateDelay(30);
    logger.debug('ISO 14230: fast init complete, ECU responded with StartCommunicationPositiveResponse');
  }

  /** KWP2000 5-baud initialization (same as ISO 9141-2 5-baud sequence) */
  private async performFiveBaudInit(): Promise<void> {
    logger.debug('ISO 14230: 5-baud init sequence starting');
    await this.simulateDelay(350);
    logger.debug('ISO 14230: 5-baud init complete');
  }

  /** Simulate ECU KWP2000 response */
  private async simulateEcuResponse(request: string): Promise<string> {
    await this.simulateDelay(25);
    const parts = request.trim().split(/\s+/);
    const service = parts[0] ?? '01';
    const pid = parts[1] ?? '00';
    const responseService = (parseInt(service, 16) + 0x40).toString(16).toUpperCase().padStart(2, '0');
    return `${responseService} ${pid} 00 00 00 00`;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private errorResponse(error: string, responseTime = 0): ProtocolResponse {
    return { success: false, error, timestamp: new Date(), responseTime };
  }
}
