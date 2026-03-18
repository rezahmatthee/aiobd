/**
 * Mode $09 - Vehicle Information
 * SAE J1979 standard for requesting vehicle information
 */

export enum VehicleInfoType {
  VIN_MESSAGE_COUNT = 0x01,
  VIN = 0x02,
  CALIBRATION_ID_MESSAGE_COUNT = 0x03,
  CALIBRATION_ID = 0x04,
  CVN_MESSAGE_COUNT = 0x05,
  CVN = 0x06,
  PERFORMANCE_TRACKING_MESSAGE_COUNT = 0x07,
  PERFORMANCE_TRACKING = 0x08,
  ECU_NAME_MESSAGE_COUNT = 0x09,
  ECU_NAME = 0x0A,
}

export interface VehicleInfo {
  vin?: string;
  calibrationId?: string;
  cvn?: string;
  ecuName?: string;
  performanceTracking?: string;
  rawResponses: Record<number, number[]>;
}

// VehicleInfoType descriptions
export const VEHICLE_INFO_DESCRIPTIONS: Record<number, string> = {
  0x00: 'Supported PIDs',
  0x01: 'VIN Message Count',
  0x02: 'Vehicle Identification Number (VIN)',
  0x03: 'Calibration ID Message Count',
  0x04: 'Calibration ID',
  0x05: 'Calibration Verification Number (CVN) Message Count',
  0x06: 'Calibration Verification Number (CVN)',
  0x07: 'In-Use Performance Tracking Message Count',
  0x08: 'In-Use Performance Tracking',
  0x09: 'ECU Name Message Count',
  0x0A: 'ECU Name',
};

/**
 * Parse VIN from Mode $09 response bytes
 * VIN is 17 characters, encoded as ASCII bytes
 */
export function parseVIN(bytes: number[]): string {
  // First byte is the message count, skip it
  // VIN starts after the first byte
  const vinBytes = bytes.slice(1).filter((b) => b !== 0x00);
  return vinBytes.map((b) => String.fromCharCode(b)).join('').slice(0, 17);
}

/**
 * Parse Calibration ID from Mode $09 response bytes
 */
export function parseCalibrationId(bytes: number[]): string {
  // Skip message count byte
  const calBytes = bytes.slice(1).filter((b) => b !== 0x00);
  return calBytes.map((b) => String.fromCharCode(b)).join('').trim();
}

/**
 * Parse CVN from Mode $09 response bytes
 * CVN is 4 bytes, represented as hex string
 */
export function parseCVN(bytes: number[]): string {
  // Skip message count byte
  const cvnBytes = bytes.slice(1, 5);
  return cvnBytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

/**
 * Parse ECU name from Mode $09 response bytes
 */
export function parseECUName(bytes: number[]): string {
  // Skip message count byte
  const nameBytes = bytes.slice(1).filter((b) => b !== 0x00);
  return nameBytes.map((b) => String.fromCharCode(b)).join('').trim();
}

/**
 * Build Mode $09 request bytes
 * @param infoType - Vehicle info type to request
 */
export function buildMode09Request(infoType: VehicleInfoType): number[] {
  return [0x09, infoType];
}

/**
 * Assemble complete VehicleInfo from multiple Mode $09 responses
 */
export function assembleVehicleInfo(responses: Map<number, number[]>): VehicleInfo {
  const info: VehicleInfo = {
    rawResponses: {},
  };

  responses.forEach((bytes, infoType) => {
    info.rawResponses[infoType] = bytes;

    switch (infoType) {
      case VehicleInfoType.VIN:
        info.vin = parseVIN(bytes);
        break;
      case VehicleInfoType.CALIBRATION_ID:
        info.calibrationId = parseCalibrationId(bytes);
        break;
      case VehicleInfoType.CVN:
        info.cvn = parseCVN(bytes);
        break;
      case VehicleInfoType.ECU_NAME:
        info.ecuName = parseECUName(bytes);
        break;
    }
  });

  return info;
}
