/**
 * ELM327 adapter implementation with simulated in-memory serial port.
 * The ELM327 chip translates between PC serial/USB and OBD2 bus protocols.
 * All communication uses AT commands for configuration and OBD2 hex strings for data.
 * This implementation simulates the ELM327 for testability without real hardware.
 */
import { BaseAdapter, AdapterInfo, AdapterConfig } from './adapter';
import { ProtocolType } from '../../types/protocol';
import { ELM327_COMMANDS, ELM327_RESPONSES } from '../../utils/constants';
import { cleanResponse, isErrorResponse } from '../../utils/obd_parser';

/** ELM327 internal state */
interface ELM327State {
  echo: boolean;
  linefeed: boolean;
  headers: boolean;
  spaces: boolean;
  protocol: ProtocolType;
  voltage: number;
  timeout: number;
}

export class ELM327Adapter extends BaseAdapter {
  private static readonly DEVICE_VERSION = 'ELM327 v2.2';
  private static readonly DEFAULT_VOLTAGE = 12.4;

  private state: ELM327State = {
    echo: false,
    linefeed: false,
    headers: false,
    spaces: false,
    protocol: ProtocolType.AUTO,
    voltage: ELM327Adapter.DEFAULT_VOLTAGE,
    timeout: 200,
  };

  /** Simulated response buffer for async command handling */
  private responseQueue: Map<string, string> = new Map();

  constructor(config: AdapterConfig) {
    super(config);
    this.setupSimulatedResponses();
  }

  async open(): Promise<void> {
    this.log('info', `Opening simulated port: ${this.config.port} @ ${this.config.baudRate} baud`);
    await this.delay(50);
    this.connected = true;
    this.emit('open');
    this.log('info', 'ELM327 adapter opened');
  }

  async close(): Promise<void> {
    this.connected = false;
    this.emit('close');
    this.log('info', 'ELM327 adapter closed');
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connected) {
      throw new Error('Adapter not connected');
    }

    const cmd = command.trim().toUpperCase();
    this.log('debug', `TX: ${cmd}`);

    await this.delay(this.calculateCommandDelay(cmd));

    const response = await this.processCommand(cmd);
    this.log('debug', `RX: ${response}`);
    return response;
  }

  async getAdapterInfo(): Promise<AdapterInfo> {
    const versionResponse = await this.sendCommand(ELM327_COMMANDS.DEVICE_INFO);
    const voltageResponse = await this.sendCommand(ELM327_COMMANDS.READ_VOLTAGE);

    const version = versionResponse.includes('ELM327')
      ? versionResponse.trim()
      : ELM327Adapter.DEVICE_VERSION;

    const voltageMatch = voltageResponse.match(/([\d.]+)V/);
    const voltage = voltageMatch ? parseFloat(voltageMatch[1] ?? '12.4') : ELM327Adapter.DEFAULT_VOLTAGE;

    return {
      name: 'ELM327',
      version,
      voltage,
      protocol: this.state.protocol,
    };
  }

  async setProtocol(protocol: ProtocolType): Promise<void> {
    const protocolNum = protocol.toString();
    const cmd = `ATSP${protocolNum}`;
    const response = await this.sendCommand(cmd);
    if (response.includes(ELM327_RESPONSES.OK)) {
      this.state.protocol = protocol;
      this.log('info', `Protocol set to ${ProtocolType[protocol]}`);
    } else {
      throw new Error(`Failed to set protocol: ${response}`);
    }
  }

  async resetAdapter(): Promise<void> {
    this.log('info', 'Resetting ELM327 adapter');
    await this.sendCommand(ELM327_COMMANDS.RESET);
    this.state = {
      echo: false,
      linefeed: false,
      headers: false,
      spaces: false,
      protocol: ProtocolType.AUTO,
      voltage: ELM327Adapter.DEFAULT_VOLTAGE,
      timeout: 200,
    };
    await this.delay(500); // ELM327 reset takes ~500ms
    this.log('info', 'ELM327 reset complete');
  }

  /** Process an AT command or OBD2 request and return simulated response */
  private async processCommand(cmd: string): Promise<string> {
    // Handle AT commands
    if (cmd.startsWith('AT')) {
      return this.handleATCommand(cmd);
    }

    // Handle OBD2 hex requests
    return this.handleOBD2Request(cmd);
  }

  /** Handle ELM327 AT command */
  private handleATCommand(cmd: string): string {
    // Check pre-configured responses first
    const queued = this.responseQueue.get(cmd);
    if (queued !== undefined) return queued;

    if (cmd === ELM327_COMMANDS.RESET || cmd === 'ATZ') {
      return `\r\n${ELM327Adapter.DEVICE_VERSION}\r\n>`;
    }
    if (cmd === ELM327_COMMANDS.ECHO_OFF) { this.state.echo = false; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.ECHO_ON) { this.state.echo = true; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.LINEFEEDS_OFF) { this.state.linefeed = false; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.LINEFEEDS_ON) { this.state.linefeed = true; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.HEADERS_OFF) { this.state.headers = false; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.HEADERS_ON) { this.state.headers = true; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.SPACES_OFF) { this.state.spaces = false; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.SPACES_ON) { this.state.spaces = true; return ELM327_RESPONSES.OK; }
    if (cmd === ELM327_COMMANDS.DEVICE_INFO) return ELM327Adapter.DEVICE_VERSION;
    if (cmd === ELM327_COMMANDS.READ_VOLTAGE) return `${this.state.voltage.toFixed(1)}V`;
    if (cmd === ELM327_COMMANDS.DESCRIBE_PROTOCOL_NUM) {
      return this.state.protocol.toString();
    }
    if (cmd === ELM327_COMMANDS.DESCRIBE_PROTOCOL) {
      return ProtocolType[this.state.protocol] ?? 'AUTO';
    }
    if (cmd === ELM327_COMMANDS.ADAPTIVE_TIMING_0 ||
        cmd === ELM327_COMMANDS.ADAPTIVE_TIMING_1 ||
        cmd === ELM327_COMMANDS.ADAPTIVE_TIMING_2) {
      return ELM327_RESPONSES.OK;
    }
    if (cmd.startsWith('ATSP')) {
      const protocolNum = parseInt(cmd.slice(4), 10);
      if (!isNaN(protocolNum) && protocolNum >= 0 && protocolNum <= 11) {
        this.state.protocol = protocolNum as ProtocolType;
        return ELM327_RESPONSES.OK;
      }
    }
    if (cmd.startsWith('ATST')) {
      const timeout = parseInt(cmd.slice(4), 16);
      if (!isNaN(timeout)) {
        this.state.timeout = timeout * 4; // ELM327 timeout unit = 4ms
        return ELM327_RESPONSES.OK;
      }
    }

    return ELM327_RESPONSES.OK;
  }

  /** Generate simulated OBD2 response for a hex request */
  private handleOBD2Request(cmd: string): string {
    const parts = cmd.replace(/\s+/g, '').match(/.{1,2}/g) ?? [];
    if (parts.length < 1) return ELM327_RESPONSES.NO_DATA;

    const service = parseInt(parts[0] ?? 'FF', 16);
    const pid = parts.length > 1 ? parseInt(parts[1] ?? '00', 16) : 0;
    const responseService = ((service + 0x40) & 0xFF).toString(16).toUpperCase().padStart(2, '0');
    const pidHex = pid.toString(16).toUpperCase().padStart(2, '0');

    switch (service) {
      case 0x01: return this.simulateMode01(responseService, pid, pidHex);
      case 0x03: return this.simulateMode03(responseService);
      case 0x04: return ELM327_RESPONSES.OK;
      case 0x07: return `${responseService} 00`; // No pending DTCs
      case 0x09: return this.simulateMode09(responseService, pid, pidHex);
      case 0x0A: return `${responseService} 00`; // No permanent DTCs
      default: return ELM327_RESPONSES.NO_DATA;
    }
  }

  /** Simulate Mode 01 (current data) responses */
  private simulateMode01(responseService: string, pid: number, pidHex: string): string {
    const responses: Record<number, string> = {
      0x00: `${responseService} ${pidHex} BE 3F A8 13`, // Supported PIDs bitfield
      0x04: `${responseService} ${pidHex} 64`,          // Engine load: 39%
      0x05: `${responseService} ${pidHex} 5A`,          // Coolant: 50°C
      0x0C: `${responseService} ${pidHex} 0F A0`,       // RPM: 1000
      0x0D: `${responseService} ${pidHex} 3C`,          // Speed: 60 km/h
      0x0E: `${responseService} ${pidHex} 80`,          // Timing: 0°
      0x0F: `${responseService} ${pidHex} 46`,          // IAT: 30°C
      0x10: `${responseService} ${pidHex} 01 4A`,       // MAF: 3.3 g/s
      0x11: `${responseService} ${pidHex} 3C`,          // Throttle: 23%
      0x1F: `${responseService} ${pidHex} 00 78`,       // Run time: 120s
      0x2F: `${responseService} ${pidHex} 7F`,          // Fuel: 50%
      0x42: `${responseService} ${pidHex} 2F 4C`,       // Voltage: 12.1V
      0x46: `${responseService} ${pidHex} 46`,          // Ambient: 30°C
      0x5C: `${responseService} ${pidHex} 5F`,          // Oil temp: 55°C
    };
    return responses[pid] ?? ELM327_RESPONSES.NO_DATA;
  }

  /** Simulate Mode 03 (DTC) response - returns one sample DTC */
  private simulateMode03(responseService: string): string {
    // P0420: Catalyst System Efficiency Below Threshold (Bank 1)
    return `${responseService} 01 04 20 00 00`;
  }

  /** Simulate Mode 09 (vehicle info) responses */
  private simulateMode09(responseService: string, pid: number, pidHex: string): string {
    const responses: Record<number, string> = {
      0x00: `${responseService} ${pidHex} 54 00 00 00`, // Supported info PIDs
      0x02: `${responseService} ${pidHex} 01 31 47 31 4A 43 35 34 34 34 52 37 32 35 32 37 38 39`, // VIN
      0x04: `${responseService} ${pidHex} 01 31 32 33 34 35 36 37 38`, // Calibration ID
    };
    return responses[pid] ?? ELM327_RESPONSES.NO_DATA;
  }

  /** Pre-configure known command responses */
  private setupSimulatedResponses(): void {
    this.responseQueue.set('ATDP', 'ISO 15765-4 (CAN 11/500)');
    this.responseQueue.set('ATDPN', '6');
  }

  /** Calculate realistic command processing delay */
  private calculateCommandDelay(cmd: string): number {
    if (cmd === 'ATZ') return 500;
    if (cmd.startsWith('AT')) return 10;
    return 50; // OBD2 requests take longer
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/** Check if a string is a valid ELM327 response (not an error) */
export function isValidELM327Response(response: string): boolean {
  return !isErrorResponse(response) && cleanResponse(response).length > 0;
}
