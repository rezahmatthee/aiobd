import { ProtocolType } from './protocol';
import { PIDValue } from './pid';

export enum DiagnosticSessionStatus {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface DTCCode {
  code: string;
  description: string;
  system: string;
  type: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface DiagnosticSession {
  id: string;
  vehicleId: string;
  protocol: ProtocolType;
  status: DiagnosticSessionStatus;
  startedAt: string;
  endedAt?: string;
  pidValues: PIDValue[];
  dtcCodes: DTCCode[];
}

export interface Vehicle {
  id: string;
  vin?: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
}
