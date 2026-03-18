import { PIDDefinition } from '../../types/pid';

export const GM_PIDS: PIDDefinition[] = [
  {
    mode: 0x22,
    pid: 0x0100,
    name: 'GM_DESIRED_IDLE_SPEED',
    description: 'GM: Desired idle speed',
    minValue: 0,
    maxValue: 16383.75,
    unit: 'RPM',
    bytes: 2,
    formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 4,
  },
  {
    mode: 0x22,
    pid: 0x0110,
    name: 'GM_BATTERY_VOLTAGE',
    description: 'GM: Battery voltage',
    minValue: 0,
    maxValue: 65.535,
    unit: 'V',
    bytes: 2,
    formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 1000,
  },
  {
    mode: 0x22,
    pid: 0x1000,
    name: 'GM_FUEL_TRIM_LEARN',
    description: 'GM: Fuel trim learn status',
    minValue: 0,
    maxValue: 1,
    unit: '',
    bytes: 1,
    formula: (bytes) => bytes[0] & 0x01,
  },
];

export const GM_MANUFACTURER_ID = 'GM';
