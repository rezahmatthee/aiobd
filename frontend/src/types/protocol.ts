export enum ProtocolType {
  SAE_J1850_PWM = 'SAE_J1850_PWM',
  SAE_J1850_VPW = 'SAE_J1850_VPW',
  ISO_9141_2 = 'ISO_9141_2',
  ISO_14230 = 'ISO_14230',
  ISO_15765 = 'ISO_15765',
  ISO_27145 = 'ISO_27145',
  AUTO = 'AUTO',
}

export enum ProtocolStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface ProtocolInfo {
  type: ProtocolType;
  name: string;
  description: string;
  baudRate: number;
  standard: string;
}

export const PROTOCOL_INFO: Record<ProtocolType, ProtocolInfo> = {
  [ProtocolType.SAE_J1850_PWM]: {
    type: ProtocolType.SAE_J1850_PWM,
    name: 'SAE J1850 PWM',
    description: 'Used by Ford vehicles (41.6 kbps)',
    baudRate: 41600,
    standard: 'SAE J1850',
  },
  [ProtocolType.SAE_J1850_VPW]: {
    type: ProtocolType.SAE_J1850_VPW,
    name: 'SAE J1850 VPW',
    description: 'Used by GM vehicles (10.4 kbps)',
    baudRate: 10400,
    standard: 'SAE J1850',
  },
  [ProtocolType.ISO_9141_2]: {
    type: ProtocolType.ISO_9141_2,
    name: 'ISO 9141-2',
    description: 'European and Asian vehicles (10.4 kbps)',
    baudRate: 10400,
    standard: 'ISO 9141',
  },
  [ProtocolType.ISO_14230]: {
    type: ProtocolType.ISO_14230,
    name: 'ISO 14230 (KWP2000)',
    description: 'Keyword Protocol 2000 (10.4 kbps)',
    baudRate: 10400,
    standard: 'ISO 14230',
  },
  [ProtocolType.ISO_15765]: {
    type: ProtocolType.ISO_15765,
    name: 'ISO 15765 (CAN)',
    description: 'Modern CAN bus protocol (500 kbps)',
    baudRate: 500000,
    standard: 'ISO 15765',
  },
  [ProtocolType.ISO_27145]: {
    type: ProtocolType.ISO_27145,
    name: 'ISO 27145 (WWH-OBD)',
    description: 'World Wide Harmonized OBD (500 kbps)',
    baudRate: 500000,
    standard: 'ISO 27145',
  },
  [ProtocolType.AUTO]: {
    type: ProtocolType.AUTO,
    name: 'Auto Detect',
    description: 'Automatically detect protocol',
    baudRate: 0,
    standard: 'Auto',
  },
};
