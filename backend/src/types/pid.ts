/**
 * OBD2 PID (Parameter ID) type definitions
 */

/** OBD2 Service/Mode numbers */
export enum OBD2Service {
  CURRENT_DATA = 0x01,
  FREEZE_FRAME = 0x02,
  DTC = 0x03,
  CLEAR_DTC = 0x04,
  O2_SENSOR_MONITORING = 0x05,
  ONBOARD_MONITORING = 0x06,
  PENDING_DTC = 0x07,
  CONTROL_OPERATION = 0x08,
  VEHICLE_INFO = 0x09,
  PERMANENT_DTC = 0x0A,
}

/** PID data type */
export enum PIDDataType {
  UINT8 = 'uint8',
  INT8 = 'int8',
  UINT16 = 'uint16',
  INT16 = 'int16',
  UINT32 = 'uint32',
  FLOAT = 'float',
  STRING = 'string',
  BITFIELD = 'bitfield',
  ENCODED = 'encoded',
}

/** PID definition */
export interface PIDDefinition {
  pid: number;
  service: OBD2Service;
  name: string;
  description: string;
  unit: string;
  dataType: PIDDataType;
  min: number;
  max: number;
  formula: string;
  byteCount: number;
  supported?: boolean;
}

/** PID reading result */
export interface PIDReading {
  pid: number;
  service: OBD2Service;
  name: string;
  value: number | string;
  unit: string;
  rawBytes: string;
  timestamp: Date;
  valid: boolean;
}

/** Supported PIDs response */
export interface SupportedPIDs {
  service: OBD2Service;
  pids: number[];
  raw: string;
}

/** Freeze frame data */
export interface FreezeFrameData {
  dtc: string;
  frameNumber: number;
  readings: PIDReading[];
  timestamp: Date;
}
