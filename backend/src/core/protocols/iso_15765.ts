/**
 * ISO 15765-4 CAN protocol implementation (500 kbaud / 250 kbaud).
 * Supports 11-bit (standard) and 29-bit (extended) CAN addressing.
 * Implements ISO 15765-2 transport layer for multi-frame messages:
 *   - Single Frame (SF): up to 7 bytes
 *   - First Frame (FF) + Consecutive Frames (CF): up to 4095 bytes
 *   - Flow Control (FC): window size and separation time
 * This is a simulation implementation for testability without real hardware.
 */
import { BaseProtocol } from './base';
import { ProtocolConfig, ProtocolResponse, ConnectionState, ProtocolType } from '../../types/protocol';
import { logger } from '../../utils/logger';
import { isErrorResponse, cleanResponse } from '../../utils/obd_parser';

/** CAN frame types per ISO 15765-2 */
const enum FrameType {
  SINGLE = 0x00,
  FIRST = 0x10,
  CONSECUTIVE = 0x20,
  FLOW_CONTROL = 0x30,
}

export class ISO15765Protocol extends BaseProtocol {
  /** OBD2 functional request CAN ID (11-bit) */
  private static readonly FUNC_REQ_ID_11BIT = 0x7DF;
  /** OBD2 ECU response CAN ID range (11-bit): 0x7E8-0x7EF */
  private static readonly ECU_RESP_ID_11BIT = 0x7E8;
  /** OBD2 functional request CAN ID (29-bit) */
  private static readonly FUNC_REQ_ID_29BIT = 0x18DB33F1;
  /** OBD2 ECU response CAN ID (29-bit) */
  private static readonly ECU_RESP_ID_29BIT = 0x18DAF110;
  /** ISO 15765-2 flow control: block size 0 (send all), ST 0 (max speed) */
  private static readonly FC_BLOCK_SIZE = 0;
  private static readonly FC_SEPARATION_TIME = 0;

  private readonly use29Bit: boolean;
  private readonly baudRate: number;

  constructor(config: ProtocolConfig) {
    super(config);
    this.use29Bit =
      config.type === ProtocolType.ISO_15765_4_CAN_29BIT_500K ||
      config.type === ProtocolType.ISO_15765_4_CAN_29BIT_250K;
    this.baudRate =
      config.type === ProtocolType.ISO_15765_4_CAN_11BIT_250K ||
      config.type === ProtocolType.ISO_15765_4_CAN_29BIT_250K
        ? 250000
        : 500000;
  }

  async connect(): Promise<void> {
    this.setState(ConnectionState.CONNECTING);
    logger.debug(`ISO 15765 CAN: opening ${this.baudRate / 1000}K baud ${this.use29Bit ? '29-bit' : '11-bit'} bus`);
    await this.simulateDelay(30);
    this.setState(ConnectionState.CONNECTED);
    logger.info(`ISO 15765 CAN: connected (${this.baudRate / 1000}kbaud, ${this.use29Bit ? '29' : '11'}-bit)`);
  }

  async disconnect(): Promise<void> {
    this.setState(ConnectionState.DISCONNECTED);
    logger.info('ISO 15765 CAN: disconnected');
  }

  async initialize(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    logger.info('ISO 15765 CAN: protocol initialization complete');
  }

  async sendRequest(request: string): Promise<ProtocolResponse> {
    if (!this.isConnected) {
      return this.errorResponse('Not connected');
    }

    const start = Date.now();
    const dataBytes = request.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) ?? [];

    // Build ISO 15765-2 transport frame(s)
    const frames = this.buildTransportFrames(dataBytes);
    logger.debug(`ISO 15765 TX [${this.use29Bit ? '29-bit' : '11-bit'}]: ${frames.join(' | ')}`);

    const raw = await this.simulateEcuResponse(request);
    const responseTime = Date.now() - start;

    if (isErrorResponse(raw)) {
      return this.errorResponse(raw, responseTime);
    }

    return this.parseResponse(raw, responseTime);
  }

  parseResponse(raw: string, responseTime = 0): ProtocolResponse {
    const cleaned = cleanResponse(raw);
    // Remove CAN ID and length byte if present
    const parts = cleaned.split(/\s+/);
    // If response starts with CAN ID (3+ chars before data), strip it
    const payload = parts.length > 2 ? parts.slice(1).join(' ') : cleaned;
    return {
      success: true,
      raw: payload,
      data: Buffer.from(payload.replace(/\s/g, ''), 'hex'),
      timestamp: new Date(),
      responseTime,
    };
  }

  /** Build ISO 15765-2 CAN transport frames */
  private buildTransportFrames(data: number[]): string[] {
    const canId = this.use29Bit
      ? ISO15765Protocol.FUNC_REQ_ID_29BIT
      : ISO15765Protocol.FUNC_REQ_ID_11BIT;
    const idHex = canId.toString(16).toUpperCase().padStart(this.use29Bit ? 8 : 3, '0');

    if (data.length <= 7) {
      // Single frame: [0x0N DATA...]  N = length
      const sf = [FrameType.SINGLE | data.length, ...data];
      while (sf.length < 8) sf.push(0xAA); // padding
      return [`${idHex}#${sf.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`];
    }

    // Multi-frame: First Frame + Consecutive Frames
    const frames: string[] = [];
    const totalLen = data.length;
    const ff = [
      FrameType.FIRST | ((totalLen >> 8) & 0x0F),
      totalLen & 0xFF,
      ...data.slice(0, 6),
    ];
    frames.push(`${idHex}#${ff.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`);

    // Flow control response would be received here in real implementation
    let sn = 1;
    for (let offset = 6; offset < data.length; offset += 7) {
      const cf = [FrameType.CONSECUTIVE | (sn & 0x0F), ...data.slice(offset, offset + 7)];
      while (cf.length < 8) cf.push(0xAA);
      frames.push(`${idHex}#${cf.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`);
      sn = (sn + 1) & 0x0F;
    }

    return frames;
  }

  /** Simulate ECU CAN response */
  private async simulateEcuResponse(request: string): Promise<string> {
    await this.simulateDelay(15);
    const parts = request.trim().split(/\s+/);
    const service = parts[0] ?? '01';
    const pid = parts[1] ?? '00';
    const responseService = (parseInt(service, 16) + 0x40).toString(16).toUpperCase().padStart(2, '0');
    const respId = this.use29Bit
      ? ISO15765Protocol.ECU_RESP_ID_29BIT.toString(16).toUpperCase().padStart(8, '0')
      : ISO15765Protocol.ECU_RESP_ID_11BIT.toString(16).toUpperCase().padStart(3, '0');
    // Single frame response: [03 responseService pid data data data]
    return `${respId} 04 ${responseService} ${pid} 00 00`;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private errorResponse(error: string, responseTime = 0): ProtocolResponse {
    return { success: false, error, timestamp: new Date(), responseTime };
  }
}
