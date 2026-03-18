import { PIDDefinition } from '../../types/pid';

export const TOYOTA_PIDS: PIDDefinition[] = [
  {
    mode: 0x22,
    pid: 0x0110,
    name: 'TOYOTA_INJECTOR_CORRECTION',
    description: 'Toyota: Injector correction',
    minValue: -100,
    maxValue: 99.2,
    unit: '%',
    bytes: 1,
    formula: (bytes) => (bytes[0] / 1.28) - 100,
  },
  {
    mode: 0x22,
    pid: 0x0111,
    name: 'TOYOTA_HYBRID_BATTERY_TEMP',
    description: 'Toyota: Hybrid battery temperature',
    minValue: -40,
    maxValue: 215,
    unit: '°C',
    bytes: 1,
    formula: (bytes) => bytes[0] - 40,
  },
  {
    mode: 0x22,
    pid: 0x0200,
    name: 'TOYOTA_SOC',
    description: 'Toyota: Hybrid battery state of charge',
    minValue: 0,
    maxValue: 100,
    unit: '%',
    bytes: 1,
    formula: (bytes) => (bytes[0] / 255) * 100,
  },
];

export const TOYOTA_MANUFACTURER_ID = 'TOYOTA';
