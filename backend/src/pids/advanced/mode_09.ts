import { OBD2Service } from '../../types';

/** Mode $09 vehicle information type identifiers */
export enum InfoType {
  MESSAGE_COUNT_VIN = 0x01,
  VIN = 0x02,
  MESSAGE_COUNT_CALID = 0x03,
  CALIBRATION_ID = 0x04,
  MESSAGE_COUNT_CVN = 0x05,
  CVN = 0x06,
  MESSAGE_COUNT_IN_USE_PERF = 0x07,
  IN_USE_PERFORMANCE_TRACKING = 0x08,
  MESSAGE_COUNT_ECU_NAME = 0x09,
  ECU_NAME = 0x0A,
  IN_USE_PERFORMANCE_TRACKING_2 = 0x0B,
}

/** Definition for a Mode $09 (Vehicle Info) parameter */
export interface Mode09Definition {
  infoType: InfoType;
  service: OBD2Service;
  name: string;
  description: string;
  byteCount: number;
  format: 'ascii' | 'hex' | 'numeric';
}

/** Standard Mode $09 definitions */
export const MODE_09_DEFINITIONS: Mode09Definition[] = [
  {
    infoType: InfoType.MESSAGE_COUNT_VIN,
    service: OBD2Service.VEHICLE_INFO,
    name: 'VIN Message Count',
    description: 'Number of data items for VIN',
    byteCount: 1,
    format: 'numeric',
  },
  {
    infoType: InfoType.VIN,
    service: OBD2Service.VEHICLE_INFO,
    name: 'Vehicle Identification Number',
    description: '17-character VIN as ASCII',
    byteCount: 17,
    format: 'ascii',
  },
  {
    infoType: InfoType.MESSAGE_COUNT_CALID,
    service: OBD2Service.VEHICLE_INFO,
    name: 'Calibration ID Message Count',
    description: 'Number of data items for calibration IDs',
    byteCount: 1,
    format: 'numeric',
  },
  {
    infoType: InfoType.CALIBRATION_ID,
    service: OBD2Service.VEHICLE_INFO,
    name: 'Calibration ID',
    description: '16-byte calibration ID per ECU',
    byteCount: 16,
    format: 'ascii',
  },
  {
    infoType: InfoType.MESSAGE_COUNT_CVN,
    service: OBD2Service.VEHICLE_INFO,
    name: 'CVN Message Count',
    description: 'Number of data items for CVN',
    byteCount: 1,
    format: 'numeric',
  },
  {
    infoType: InfoType.CVN,
    service: OBD2Service.VEHICLE_INFO,
    name: 'Calibration Verification Number',
    description: '4-byte CVN per ECU (CRC-32)',
    byteCount: 4,
    format: 'hex',
  },
  {
    infoType: InfoType.MESSAGE_COUNT_IN_USE_PERF,
    service: OBD2Service.VEHICLE_INFO,
    name: 'In-Use Performance Tracking Message Count',
    description: 'Number of data items for IUPT',
    byteCount: 1,
    format: 'numeric',
  },
  {
    infoType: InfoType.IN_USE_PERFORMANCE_TRACKING,
    service: OBD2Service.VEHICLE_INFO,
    name: 'In-Use Performance Tracking',
    description: 'OBD monitoring completion counters',
    byteCount: 40,
    format: 'numeric',
  },
  {
    infoType: InfoType.MESSAGE_COUNT_ECU_NAME,
    service: OBD2Service.VEHICLE_INFO,
    name: 'ECU Name Message Count',
    description: 'Number of data items for ECU name',
    byteCount: 1,
    format: 'numeric',
  },
  {
    infoType: InfoType.ECU_NAME,
    service: OBD2Service.VEHICLE_INFO,
    name: 'ECU Name',
    description: '20-character ECU name as ASCII',
    byteCount: 20,
    format: 'ascii',
  },
  {
    infoType: InfoType.IN_USE_PERFORMANCE_TRACKING_2,
    service: OBD2Service.VEHICLE_INFO,
    name: 'In-Use Performance Tracking (Compression Ignition)',
    description: 'OBD monitoring completion counters for CI engines',
    byteCount: 40,
    format: 'numeric',
  },
];

/**
 * Parse a raw Mode $09 response into a human-readable string
 */
export function parseMode09Response(infoType: InfoType, bytes: number[]): string {
  const def = MODE_09_DEFINITIONS.find((d) => d.infoType === infoType);
  if (!def) return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();

  switch (def.format) {
    case 'ascii':
      return bytes
        .filter((b) => b > 0 && b < 128)
        .map((b) => String.fromCharCode(b))
        .join('');
    case 'hex':
      return bytes.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    case 'numeric':
      return bytes.reduce((acc, b, i) => acc + (b << ((bytes.length - 1 - i) * 8)), 0).toString();
    default:
      return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
  }
}

/**
 * Find a Mode $09 definition by info type
 */
export function findMode09Definition(infoType: InfoType): Mode09Definition | undefined {
  return MODE_09_DEFINITIONS.find((d) => d.infoType === infoType);
}
