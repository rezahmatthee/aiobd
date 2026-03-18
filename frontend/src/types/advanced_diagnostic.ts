/**
 * Advanced Diagnostic Type Definitions
 * TypeScript interfaces for Phase 2 advanced OBD2 diagnostics
 */

export enum MonitorType {
  OXYGEN_SENSOR = 'OXYGEN_SENSOR',
  FUEL_SYSTEM = 'FUEL_SYSTEM',
  EVAP_SYSTEM = 'EVAP_SYSTEM',
  EGR_SYSTEM = 'EGR_SYSTEM',
  CATALYST = 'CATALYST',
  HEATED_CATALYST = 'HEATED_CATALYST',
  SECONDARY_AIR = 'SECONDARY_AIR',
  MISFIRE = 'MISFIRE',
  COMPREHENSIVE = 'COMPREHENSIVE',
}

export interface MonitorTest {
  testId: number;
  componentId: number;
  monitorType: MonitorType;
  testValue: number;
  minLimit: number;
  maxLimit: number;
  passed: boolean;
  enabled: boolean;
  complete: boolean;
}

export interface VehicleInfo {
  vin?: string;
  calibrationId?: string;
  cvn?: string;
  ecuName?: string;
  performanceTracking?: string;
}

export interface FreezeFramePID {
  pid: number;
  name: string;
  value: number | string;
  unit: string;
  rawBytes: number[];
}

export interface FreezeFrame {
  frameId: string;
  vehicleId: string;
  dtc: string;
  timestamp: string;
  pids: FreezeFramePID[];
}

// API Response Types
export interface MonitorTestsResponse {
  vehicleId: string;
  monitors: MonitorTest[];
}

export interface VehicleInfoResponse {
  vehicleId: string;
  info: VehicleInfo;
}

export interface FreezeFramesResponse {
  vehicleId: string;
  freezeFrames: FreezeFrame[];
}

export interface FreezeFrameResponse {
  vehicleId: string;
  freezeFrame: FreezeFrame;
}

export interface ApiError {
  error: string;
}
