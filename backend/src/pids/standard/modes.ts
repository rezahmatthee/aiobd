export const OBD_MODES_DESCRIPTION: Record<number, string> = {
  0x01: 'Show current data',
  0x02: 'Show freeze frame data',
  0x03: 'Show stored Diagnostic Trouble Codes',
  0x04: 'Clear Diagnostic Trouble Codes and stored values',
  0x05: 'Test results, oxygen sensor monitoring (non CAN only)',
  0x06: 'Test results, other component/system monitoring',
  0x07: 'Show pending Diagnostic Trouble Codes (detected during current or last driving cycle)',
  0x08: 'Control operation of on-board component/system',
  0x09: 'Request vehicle information',
  0x0A: 'Permanent Diagnostic Trouble Codes (DTCs) (Cleared DTCs)',
};

export const SUPPORTED_MODES = [0x01, 0x02, 0x03, 0x04, 0x06, 0x07, 0x09, 0x0A] as const;
export type SupportedMode = typeof SUPPORTED_MODES[number];
