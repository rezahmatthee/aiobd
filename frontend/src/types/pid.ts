export interface PIDValue {
  pid: number;
  mode: number;
  name: string;
  value: number | string;
  unit: string;
  timestamp: string;
  minValue?: number;
  maxValue?: number;
}

export interface PIDGroup {
  name: string;
  pids: PIDValue[];
}
