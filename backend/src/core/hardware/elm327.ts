import { ProtocolType, ProtocolConfig } from '../../types/protocol';
import { BaseAdapter, AdapterInfo, AdapterStatus } from './adapter';
import { logger } from '../../utils/logger';

export class ELM327Adapter extends BaseAdapter {
  public readonly name = 'ELM327';
  private port: string = '';

  async connect(port: string, _config?: ProtocolConfig): Promise<void> {
    this.port = port;
    this.setStatus(AdapterStatus.CONNECTING);
    logger.info(`Connecting ELM327 on port ${port}`);
    // Initialize ELM327
    await this.sendCommand('ATZ');   // Reset
    await this.sendCommand('ATE0');  // Echo off
    await this.sendCommand('ATL0');  // Linefeeds off
    await this.sendCommand('ATS0');  // Spaces off
    await this.sendCommand('ATH0');  // Headers off
    this.setStatus(AdapterStatus.CONNECTED);
    logger.info('ELM327 initialized successfully');
  }

  async disconnect(): Promise<void> {
    await this.sendCommand('ATZ');
    this.setStatus(AdapterStatus.DISCONNECTED);
  }

  async sendCommand(command: string): Promise<string> {
    // In production, this would write to the serial port and read response
    logger.debug(`ELM327 command: ${command}`);
    return 'OK';
  }

  async getAdapterInfo(): Promise<AdapterInfo> {
    const version = await this.sendCommand('ATI');
    return {
      name: 'ELM327',
      version: version || 'ELM327 v2.1',
      supportedProtocols: [
        ProtocolType.SAE_J1850_PWM,
        ProtocolType.SAE_J1850_VPW,
        ProtocolType.ISO_9141_2,
        ProtocolType.ISO_14230,
        ProtocolType.ISO_15765,
      ],
    };
  }

  async detectProtocol(): Promise<ProtocolType> {
    const response = await this.sendCommand('ATSP0'); // Auto-detect protocol
    logger.info(`Protocol detection response: ${response}`);
    // Map ELM327 protocol numbers to our types
    return ProtocolType.ISO_15765; // Default to CAN (most modern vehicles)
  }
}
