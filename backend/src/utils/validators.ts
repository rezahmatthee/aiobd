export function isValidVIN(vin: string): boolean {
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
}

export function isValidPID(pid: number): boolean {
  return pid >= 0x00 && pid <= 0xFF;
}

export function isValidMode(mode: number): boolean {
  return mode >= 0x01 && mode <= 0x0A;
}

export function isValidDTC(code: string): boolean {
  const dtcRegex = /^[PCBU][0-9]{4}$/i;
  return dtcRegex.test(code);
}

export function sanitizeHexString(hex: string): string {
  return hex.replace(/[^0-9A-Fa-f\s]/g, '').trim();
}
