import { PIDDefinition } from '../../types/pid';

export const BMW_PIDS: PIDDefinition[] = [
  {
    mode: 0x22,
    pid: 0x4510,
    name: 'BMW_VANOS_INTAKE',
    description: 'BMW: VANOS intake camshaft position',
    minValue: -90,
    maxValue: 90,
    unit: '°',
    bytes: 2,
    formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 100 - 50,
  },
  {
    mode: 0x22,
    pid: 0x4511,
    name: 'BMW_VANOS_EXHAUST',
    description: 'BMW: VANOS exhaust camshaft position',
    minValue: -90,
    maxValue: 90,
    unit: '°',
    bytes: 2,
    formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 100 - 50,
  },
  {
    mode: 0x22,
    pid: 0x4600,
    name: 'BMW_VALVETRONIC',
    description: 'BMW: Valvetronic lift',
    minValue: 0,
    maxValue: 12,
    unit: 'mm',
    bytes: 2,
    formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 1000,
  },
];

export const BMW_MANUFACTURER_ID = 'BMW';
