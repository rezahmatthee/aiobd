import { OBD2Service } from '../../types';

/** Test result for a single Mode $06 monitor */
export interface Mode06TestResult {
  mid: number;
  tid: number;
  value: number;
  min: number;
  max: number;
  passed: boolean;
  unit: string;
  description: string;
}

/** On-Board Monitor ID (OBDMID) definition */
export interface OBDMIDDefinition {
  mid: number;
  name: string;
  description: string;
  testIds: OBDTIDDefinition[];
}

/** Test ID definition within an OBDMID */
export interface OBDTIDDefinition {
  tid: number;
  name: string;
  unit: string;
  scalingFactor: number;
}

/** Mode $06 service identifier */
export const MODE_06_SERVICE = OBD2Service.ONBOARD_MONITORING;

/** Standard OBDMIDs (On-Board Monitor IDs) */
export const OBDMID_DEFINITIONS: OBDMIDDefinition[] = [
  {
    mid: 0x01,
    name: 'Oxygen Sensor Monitor Bank 1 Sensor 1',
    description: 'O2 sensor response rate and output voltage monitoring - bank 1, sensor 1',
    testIds: [
      { tid: 0x81, name: 'Rich-to-Lean Sensor Threshold Voltage', unit: 'V', scalingFactor: 0.005 },
      { tid: 0x82, name: 'Lean-to-Rich Sensor Threshold Voltage', unit: 'V', scalingFactor: 0.005 },
      { tid: 0x83, name: 'Low Sensor Voltage for Switch Time', unit: 'V', scalingFactor: 0.005 },
      { tid: 0x84, name: 'High Sensor Voltage for Switch Time', unit: 'V', scalingFactor: 0.005 },
      { tid: 0x85, name: 'Rich-to-Lean Switch Time', unit: 'ms', scalingFactor: 4 },
      { tid: 0x86, name: 'Lean-to-Rich Switch Time', unit: 'ms', scalingFactor: 4 },
      { tid: 0x87, name: 'Minimum Voltage for Test', unit: 'V', scalingFactor: 0.005 },
      { tid: 0x88, name: 'Maximum Voltage for Test', unit: 'V', scalingFactor: 0.005 },
      { tid: 0x89, name: 'Time Between Switches', unit: 'ms', scalingFactor: 4 },
    ],
  },
  {
    mid: 0x02,
    name: 'Oxygen Sensor Monitor Bank 1 Sensor 2',
    description: 'O2 sensor monitoring - bank 1, sensor 2',
    testIds: [
      { tid: 0x81, name: 'Rich-to-Lean Sensor Threshold Voltage', unit: 'V', scalingFactor: 0.005 },
      { tid: 0x82, name: 'Lean-to-Rich Sensor Threshold Voltage', unit: 'V', scalingFactor: 0.005 },
    ],
  },
  {
    mid: 0x21,
    name: 'Catalyst Monitor Bank 1',
    description: 'Catalytic converter efficiency monitoring - bank 1',
    testIds: [
      { tid: 0x01, name: 'Efficiency Below Threshold', unit: '', scalingFactor: 0.001 },
      { tid: 0x02, name: 'Efficiency at Threshold', unit: '', scalingFactor: 0.001 },
    ],
  },
  {
    mid: 0x22,
    name: 'Catalyst Monitor Bank 2',
    description: 'Catalytic converter efficiency monitoring - bank 2',
    testIds: [
      { tid: 0x01, name: 'Efficiency Below Threshold', unit: '', scalingFactor: 0.001 },
      { tid: 0x02, name: 'Efficiency at Threshold', unit: '', scalingFactor: 0.001 },
    ],
  },
  {
    mid: 0x31,
    name: 'EGR Monitor',
    description: 'Exhaust gas recirculation flow monitoring',
    testIds: [
      { tid: 0x01, name: 'EGR Flow Rate at Low', unit: 'g/s', scalingFactor: 0.01 },
      { tid: 0x02, name: 'EGR Flow Rate at High', unit: 'g/s', scalingFactor: 0.01 },
    ],
  },
  {
    mid: 0x41,
    name: 'EVAP Monitor (0.020 inch)',
    description: 'Evaporative emission system leak detection (0.020 inch)',
    testIds: [
      { tid: 0x01, name: 'Purge Flow', unit: 'g/s', scalingFactor: 0.005 },
      { tid: 0x02, name: 'Tank Vacuum', unit: 'inH2O', scalingFactor: 0.001 },
    ],
  },
  {
    mid: 0x42,
    name: 'EVAP Monitor (0.040 inch)',
    description: 'Evaporative emission system leak detection (0.040 inch)',
    testIds: [
      { tid: 0x01, name: 'Purge Flow', unit: 'g/s', scalingFactor: 0.005 },
      { tid: 0x02, name: 'Tank Vacuum', unit: 'inH2O', scalingFactor: 0.001 },
    ],
  },
  {
    mid: 0x61,
    name: 'Misfire Monitor General Data',
    description: 'Engine misfire detection - general data',
    testIds: [
      { tid: 0x01, name: 'Misfire Count', unit: 'count', scalingFactor: 1 },
      { tid: 0x02, name: 'Misfire Rate', unit: '%', scalingFactor: 0.01 },
    ],
  },
  {
    mid: 0x62,
    name: 'Misfire Monitor Cylinder 1',
    description: 'Engine misfire detection - cylinder 1',
    testIds: [
      { tid: 0x01, name: 'Cylinder 1 Misfire Count', unit: 'count', scalingFactor: 1 },
    ],
  },
  {
    mid: 0x71,
    name: 'Fuel System Monitor',
    description: 'Fuel system performance monitoring',
    testIds: [
      { tid: 0x01, name: 'Short Term FT Below Threshold', unit: '%', scalingFactor: 0.1 },
      { tid: 0x02, name: 'Short Term FT Above Threshold', unit: '%', scalingFactor: 0.1 },
      { tid: 0x03, name: 'Long Term FT Below Threshold', unit: '%', scalingFactor: 0.1 },
      { tid: 0x04, name: 'Long Term FT Above Threshold', unit: '%', scalingFactor: 0.1 },
    ],
  },
];

/**
 * Parse a raw Mode $06 response byte array into a Mode06TestResult
 */
export function parseMode06Response(
  mid: number,
  tid: number,
  bytes: number[],
): Mode06TestResult | null {
  if (bytes.length < 9) return null;

  const scaledValue = ((bytes[0] << 8) | bytes[1]);
  const scaledMin = ((bytes[2] << 8) | bytes[3]);
  const scaledMax = ((bytes[4] << 8) | bytes[5]);
  const statusByte = bytes[6];

  const midDef = OBDMID_DEFINITIONS.find((m) => m.mid === mid);
  const tidDef = midDef?.testIds.find((t) => t.tid === tid);
  const factor = tidDef?.scalingFactor ?? 1;

  return {
    mid,
    tid,
    value: scaledValue * factor,
    min: scaledMin * factor,
    max: scaledMax * factor,
    passed: (statusByte & 0x01) === 0x01,
    unit: tidDef?.unit ?? '',
    description: midDef?.name ?? `MID 0x${mid.toString(16).toUpperCase()} TID 0x${tid.toString(16).toUpperCase()}`,
  };
}
