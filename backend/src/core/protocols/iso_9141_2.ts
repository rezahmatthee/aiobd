/**
 * ISO 9141-2 protocol implementation (10.4 kbaud K-line)
 * Single-wire serial K-line used on many European vehicles (1996-2003).
 * Requires 5-baud initialization sequence: send 0x33, receive 0x55 sync,
 * receive KB1/KB2, send ~KB2, receive ~0xCC, then communicate at 10.4 kbaud.
 * This is a simulation implementation for testability without real hardware.
 */
import { BaseProtocol } from './base';
import { ProtocolConfig, ProtocolResponse, ConnectionState } from '../../types/protocol';
import { logger } from '../../utils/logger';
import { isErrorResponse, cleanResponse } from '../../utils/obd_parser';

export class ISO91412Protocol extends BaseProtocol {
  private static readonly BAUD_RATE = 10400;
  /** 5-baud init address byte */
  private static readonly INIT_ADDRESS = 0x33;
  /** Sync pattern sent by ECU after 5-baud init */
  private static readonly SYNC_BYTE = 0x55;
  /** Key bytes sent by ECU to identify protocol variant */
  private static readonly KEYWORD_1 = 0x08;
  private static readonly KEYWORD_2 = 0x08;

  constructor(config: ProtocolConfig) {
    super({ ...config, baudRate: ISO91412Protocol.BAUD_RATE });
  }

  async connect(): Promise<void> {
    this.setState(ConnectionState.CONNECTING);
    logger.debug('ISO 9141-2: starting 5-baud K-line initialization');
    await this.performFiveBaudInit();
    this.setState(ConnectionState.CONNECTED);
    logger.info('ISO 9141-2: K-line initialized and connected');
  }

  async disconnect(): Promise<void> {
    this.setState(ConnectionState.DISCONNECTED);
    logger.info('ISO 9141-2: disconnected');
  }

  async initialize(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    logger.info('ISO 9141-2: protocol initialization complete');
  }

  async sendRequest(request: string): Promise<ProtocolResponse> {
    if (!this.isConnected) {
      return this.errorResponse('Not connected');
    }

    const start = Date.now();
    logger.debug(`ISO 9141-2 TX: ${request}`);

    const raw = await this.simulateEcuResponse(request);
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

  /**
   * Simulate ISO 9141-2 5-baud initialization sequence:
   * 1. Send 0x33 at 5 baud (200ms per bit → 2 second total)
   * 2. Wait for 0x55 sync from ECU
   * 3. Read KB1 + KB2 keyword bytes
   * 4. Echo inverted KB2 back
   * 5. Receive 0xCC (inverted 0x33 address confirmation)
   */
  private async performFiveBaudInit(): Promise<void> {
    logger.debug(`ISO 9141-2: sending init address 0x${ISO91412Protocol.INIT_ADDRESS.toString(16).toUpperCase()} at 5 baud`);
    await this.simulateDelay(300); // Simulated 5-baud send time
    logger.debug(`ISO 9141-2: received sync 0x${ISO91412Protocol.SYNC_BYTE.toString(16).toUpperCase()}`);
    await this.simulateDelay(10);
    logger.debug(`ISO 9141-2: received keywords 0x${ISO91412Protocol.KEYWORD_1.toString(16).toUpperCase()} 0x${ISO91412Protocol.KEYWORD_2.toString(16).toUpperCase()}`);
    await this.simulateDelay(10);
    const invertedKB2 = (~ISO91412Protocol.KEYWORD_2 & 0xFF);
    logger.debug(`ISO 9141-2: sending inverted KB2: 0x${invertedKB2.toString(16).toUpperCase()}`);
    await this.simulateDelay(20);
    logger.debug('ISO 9141-2: received 0xCC address confirmation');
  }

  /** Simulate ECU response at 10.4 kbaud */
  private async simulateEcuResponse(request: string): Promise<string> {
    await this.simulateDelay(30);
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
