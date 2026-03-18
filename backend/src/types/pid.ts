export enum PIDMode {
  CURRENT_DATA = 0x01,
  FREEZE_FRAME = 0x02,
  FAULT_CODES = 0x03,
  CLEAR_FAULT_CODES = 0x04,
  TEST_RESULTS_NON_CAN = 0x05,
  TEST_RESULTS_CAN = 0x06,
  PENDING_FAULT_CODES = 0x07,
  CONTROL_OPERATION = 0x08,
  VEHICLE_INFO = 0x09,
  PERMANENT_FAULT_CODES = 0x0A,
}

export interface PIDDefinition {
  mode: number;
  pid: number;
  name: string;
  description: string;
  minValue: number;
  maxValue: number;
  unit: string;
  formula: (bytes: number[]) => number | string;
  bytes: number;
}

export interface PIDValue {
  pid: PIDDefinition;
  rawValue: number[];
  calculatedValue: number | string;
  unit: string;
  timestamp: Date;
}

export interface PIDLookupResult {
  found: boolean;
  definition?: PIDDefinition;
}
