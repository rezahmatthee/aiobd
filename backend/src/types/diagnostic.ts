/**
 * Diagnostic session and DTC type definitions
 */
import { ProtocolType } from './protocol';
import { PIDReading } from './pid';

/** DTC category */
export enum DTCCategory {
  POWERTRAIN = 'P',
  CHASSIS = 'C',
  BODY = 'B',
  NETWORK = 'U',
}

/** DTC severity */
export enum DTCSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/** Diagnostic Trouble Code */
export interface DTCCode {
  code: string;
  category: DTCCategory;
  description: string;
  severity: DTCSeverity;
  isPending: boolean;
  isPermanent: boolean;
  timestamp?: Date;
  freezeFrameAvailable: boolean;
}

/** Diagnostic session status */
export enum SessionStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
}

/** Diagnostic session */
export interface DiagnosticSession {
  id: string;
  userId: string;
  vehicleId?: string;
  protocol: ProtocolType;
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date;
  dtcs: DTCCode[];
  readings: PIDReading[];
  metadata: Record<string, unknown>;
}

/** Readiness monitor status */
export interface ReadinessMonitor {
  name: string;
  available: boolean;
  complete: boolean;
}

/** OBD2 readiness monitors */
export interface ReadinessMonitors {
  misfire: ReadinessMonitor;
  fuelSystem: ReadinessMonitor;
  components: ReadinessMonitor;
  catalyst: ReadinessMonitor;
  heatedCatalyst: ReadinessMonitor;
  evaporativeSystem: ReadinessMonitor;
  secondaryAirSystem: ReadinessMonitor;
  acRefrigerant: ReadinessMonitor;
  oxygenSensor: ReadinessMonitor;
  oxygenSensorHeater: ReadinessMonitor;
  egrSystem: ReadinessMonitor;
}

/** Live data stream configuration */
export interface LiveDataConfig {
  pids: number[];
  intervalMs: number;
  bufferSize: number;
  sessionId: string;
}
