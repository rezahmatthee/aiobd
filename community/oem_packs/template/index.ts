/**
 * OEM Pack Template
 * Copy this file to backend/src/pids/manufacturer/<brand>.ts
 * and fill in your manufacturer's specific PIDs.
 */

import { PIDDefinition } from '../../../backend/src/types/pid';

// Replace MY_BRAND with your manufacturer name (e.g., HONDA, NISSAN, MAZDA)
export const MY_BRAND_PIDS: PIDDefinition[] = [
  {
    mode: 0x22, // UDS ReadDataByIdentifier - standard for proprietary PIDs
    pid: 0x0000, // Replace with actual 2-byte identifier
    name: 'MY_BRAND_PARAMETER_NAME', // UPPER_SNAKE_CASE with brand prefix
    description: 'Human-readable description of what this parameter measures',
    minValue: 0,   // Minimum possible value
    maxValue: 100, // Maximum possible value
    unit: '%',     // Unit of measurement (%, RPM, °C, V, kPa, etc.)
    bytes: 1,      // Number of data bytes in response
    formula: (bytes) => {
      // Transform raw bytes to engineering value
      // Common patterns:
      // 1-byte: bytes[0]
      // 2-byte big-endian: (bytes[0] * 256) + bytes[1]
      // Percentage: bytes[0] / 255 * 100
      // Temperature: bytes[0] - 40
      return bytes[0];
    },
  },
  // Add more PIDs here...
];

export const MY_BRAND_MANUFACTURER_ID = 'MY_BRAND';
