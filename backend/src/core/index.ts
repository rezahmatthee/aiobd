/**
 * Protocol factory - creates the appropriate protocol instance
 */
import { BaseProtocol } from './protocols/base';
import { ProtocolType, ProtocolConfig, ConnectionState } from '../types/protocol';
import { SAEJ1850PWMProtocol } from './protocols/sae_j1850_pwm';
import { SAEJ1850VPWProtocol } from './protocols/sae_j1850_vpw';
import { ISO91412Protocol } from './protocols/iso_9141_2';
import { ISO14230Protocol } from './protocols/iso_14230';
import { ISO15765Protocol } from './protocols/iso_15765';
import { ISO27145Protocol } from './protocols/iso_27145';
import { logger } from '../utils/logger';

export { BaseProtocol };
export { ConnectionState };

const DEFAULT_PROTOCOL_CONFIG: Omit<ProtocolConfig, 'type'> = {
  baudRate: 500000,
  timeout: 2000,
  retries: 3,
  headerEnabled: false,
  echoEnabled: false,
};

export function createProtocol(type: ProtocolType, configOverrides?: Partial<ProtocolConfig>): BaseProtocol {
  const config: ProtocolConfig = {
    ...DEFAULT_PROTOCOL_CONFIG,
    type,
    ...configOverrides,
  };

  logger.debug(`Creating protocol: ${ProtocolType[type]}`);

  switch (type) {
    case ProtocolType.SAE_J1850_PWM:
      return new SAEJ1850PWMProtocol(config);
    case ProtocolType.SAE_J1850_VPW:
      return new SAEJ1850VPWProtocol(config);
    case ProtocolType.ISO_9141_2:
      return new ISO91412Protocol(config);
    case ProtocolType.ISO_14230_4_KWP_5BAUD:
    case ProtocolType.ISO_14230_4_KWP_FAST:
      return new ISO14230Protocol(config);
    case ProtocolType.ISO_15765_4_CAN_11BIT_500K:
    case ProtocolType.ISO_15765_4_CAN_29BIT_500K:
    case ProtocolType.ISO_15765_4_CAN_11BIT_250K:
    case ProtocolType.ISO_15765_4_CAN_29BIT_250K:
      return new ISO15765Protocol(config);
    case ProtocolType.ISO_27145:
      return new ISO27145Protocol(config);
    default:
      throw new Error(`Unsupported protocol type: ${String(type)}`);
  }
}

export { ProtocolType, ProtocolConfig };
