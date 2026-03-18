export * from './protocols/base';
export * from './protocols/sae_j1850_pwm';
export * from './protocols/sae_j1850_vpw';
export * from './protocols/iso_9141_2';
export * from './protocols/iso_14230';
export * from './protocols/iso_15765';
export * from './protocols/iso_27145';
export * from './hardware/adapter';
export * from './hardware/elm327';

import { ProtocolType } from '../types/protocol';
import { BaseProtocol } from './protocols/base';
import { SAEJ1850PWMProtocol } from './protocols/sae_j1850_pwm';
import { SAEJ1850VPWProtocol } from './protocols/sae_j1850_vpw';
import { ISO91412Protocol } from './protocols/iso_9141_2';
import { ISO14230Protocol } from './protocols/iso_14230';
import { ISO15765Protocol } from './protocols/iso_15765';
import { ISO27145Protocol } from './protocols/iso_27145';

export function createProtocol(type: ProtocolType): BaseProtocol {
  switch (type) {
    case ProtocolType.SAE_J1850_PWM:
      return new SAEJ1850PWMProtocol();
    case ProtocolType.SAE_J1850_VPW:
      return new SAEJ1850VPWProtocol();
    case ProtocolType.ISO_9141_2:
      return new ISO91412Protocol();
    case ProtocolType.ISO_14230:
      return new ISO14230Protocol();
    case ProtocolType.ISO_15765:
      return new ISO15765Protocol();
    case ProtocolType.ISO_27145:
      return new ISO27145Protocol();
    default:
      return new ISO15765Protocol();
  }
}
