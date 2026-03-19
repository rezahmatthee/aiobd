/**
 * OBD2 Protocol type definitions
 */

/** Supported OBD2 communication protocols */
export enum ProtocolType {
  AUTO = 0,
  SAE_J1850_PWM = 1,
  SAE_J1850_VPW = 2,
  ISO_9141_2 = 3,
  ISO_14230_4_KWP_5BAUD = 4,
  ISO_14230_4_KWP_FAST = 5,
  ISO_15765_4_CAN_11BIT_500K = 6,
  ISO_15765_4_CAN_29BIT_500K = 7,
  ISO_15765_4_CAN_11BIT_250K = 8,
  ISO_15765_4_CAN_29BIT_250K = 9,
  SAE_J1939_CAN = 10,
  ISO_27145 = 11,
}

/** Protocol configuration options */
export interface ProtocolConfig {
  type: ProtocolType;
  baudRate: number;
  timeout: number;
  retries: number;
  headerEnabled: boolean;
  echoEnabled: boolean;
}

/** Raw protocol frame */
export interface ProtocolFrame {
  raw: string;
  bytes: Buffer;
  timestamp: Date;
  protocolType: ProtocolType;
}

/** Protocol connection state */
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

/** Protocol response */
export interface ProtocolResponse {
  success: boolean;
  data?: Buffer;
  raw?: string;
  error?: string;
  timestamp: Date;
  responseTime: number;
}

/** Protocol event types */
export enum ProtocolEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  DATA = 'data',
  ERROR = 'error',
  TIMEOUT = 'timeout',
}
