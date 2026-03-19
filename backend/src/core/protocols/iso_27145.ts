/**
 * ISO 27145 WWH-OBD (World Wide Harmonized On-Board Diagnostics) implementation.
 * Based on ISO 15765-4 CAN transport with enhanced UDS-style (ISO 14229) services.
 * Extends standard OBD2 with additional diagnostic services and data identifiers.
 * Primarily used on heavy-duty vehicles and newer passenger cars in EU/global markets.
 * This is a simulation implementation for testability without real hardware.
 */
import { BaseProtocol } from './base';
import { ProtocolConfig, ProtocolResponse, ConnectionState } from '../../types/protocol';
import { logger } from '../../utils/logger';
import { isErrorResponse, cleanResponse } from '../../utils/obd_parser';

/** WWH-OBD / UDS service identifiers */
const enum WWHService {
  DIAGNOSTIC_SESSION_CONTROL = 0x10,
  READ_DATA_BY_ID = 0x22,
  CLEAR_DTC = 0x14,
  READ_DTC = 0x19,
  ECU_RESET = 0x11,
}

/** WWH-OBD diagnostic session types */
const enum DiagnosticSession {
  DEFAULT = 0x01,
  EXTENDED = 0x03,
  WWH_OBD = 0x60,
}

export class ISO27145Protocol extends BaseProtocol {
  /** WWH-OBD functional addressing CAN ID (29-bit extended) */
  private static readonly FUNC_REQ_ID = 0x18DB33F1;
  /** WWH-OBD ECU response CAN ID (29-bit) */
  private static readonly ECU_RESP_ID = 0x18DAF110;
  /** WWH-OBD uses 500 kbaud CAN */
  private static readonly CAN_BAUD_RATE = 500000;

  constructor(config: ProtocolConfig) {
    super({ ...config, baudRate: ISO27145Protocol.CAN_BAUD_RATE });
  }

  async connect(): Promise<void> {
    this.setState(ConnectionState.CONNECTING);
    logger.debug(`ISO 27145 WWH-OBD: opening 29-bit CAN at ${ISO27145Protocol.CAN_BAUD_RATE / 1000}kbaud`);
    await this.simulateDelay(30);
    this.setState(ConnectionState.CONNECTED);
    logger.info('ISO 27145 WWH-OBD: CAN bus connected');
  }

  async disconnect(): Promise<void> {
    this.setState(ConnectionState.DISCONNECTED);
    logger.info('ISO 27145 WWH-OBD: disconnected');
  }

  async initialize(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    // Start WWH-OBD diagnostic session
    await this.startDiagnosticSession();
    logger.info('ISO 27145 WWH-OBD: initialization complete');
  }

  async sendRequest(request: string): Promise<ProtocolResponse> {
    if (!this.isConnected) {
      return this.errorResponse('Not connected');
    }

    const start = Date.now();
    const canId = ISO27145Protocol.FUNC_REQ_ID.toString(16).toUpperCase().padStart(8, '0');
    logger.debug(`ISO 27145 TX [${canId}]: ${request}`);

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

  /** Read data by UDS Data Identifier (2-byte DID) */
  async readDataByIdentifier(did: number): Promise<ProtocolResponse> {
    const didHigh = (did >> 8) & 0xFF;
    const didLow = did & 0xFF;
    const request = `${WWHService.READ_DATA_BY_ID.toString(16).padStart(2, '0')} ${didHigh.toString(16).padStart(2, '0')} ${didLow.toString(16).padStart(2, '0')}`;
    return this.sendRequest(request);
  }

  /** Read DTC information using UDS ReadDTCInformation (service 0x19) */
  async readDTCInformation(subFunction: number): Promise<ProtocolResponse> {
    const request = `${WWHService.READ_DTC.toString(16).padStart(2, '0')} ${subFunction.toString(16).padStart(2, '0')}`;
    return this.sendRequest(request);
  }

  /** Start WWH-OBD diagnostic session */
  private async startDiagnosticSession(): Promise<void> {
    const request = `${WWHService.DIAGNOSTIC_SESSION_CONTROL.toString(16).padStart(2, '0')} ${DiagnosticSession.WWH_OBD.toString(16).padStart(2, '0')}`;
    logger.debug(`ISO 27145: starting WWH-OBD session (${request})`);
    await this.simulateDelay(50);
    logger.debug('ISO 27145: WWH-OBD session active');
  }

  /** Simulate ECU WWH-OBD response */
  private async simulateEcuResponse(request: string): Promise<string> {
    await this.simulateDelay(20);
    const parts = request.trim().split(/\s+/);
    const service = parseInt(parts[0] ?? '01', 16);
    const respService = (service + 0x40).toString(16).toUpperCase().padStart(2, '0');
    const respId = ISO27145Protocol.ECU_RESP_ID.toString(16).toUpperCase().padStart(8, '0');
    return `${respId} ${respService} ${parts.slice(1).join(' ')} 00 00`;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private errorResponse(error: string, responseTime = 0): ProtocolResponse {
    return { success: false, error, timestamp: new Date(), responseTime };
  }
}
