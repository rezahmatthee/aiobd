/**
 * Input validation utilities for OBD2 platform
 */

/** Validates a hex string (e.g. "41 0C 1A F0") */
export function isValidHexString(value: string): boolean {
  return /^[0-9A-Fa-f\s]+$/.test(value.trim());
}

/** Validates an OBD2 PID number (0x00 - 0xFF for most services) */
export function isValidPID(pid: number): boolean {
  return Number.isInteger(pid) && pid >= 0x00 && pid <= 0xFF;
}

/** Validates an OBD2 service/mode number */
export function isValidService(service: number): boolean {
  return Number.isInteger(service) && service >= 0x01 && service <= 0x0A;
}

/** Validates a DTC code format (e.g. "P0300", "C1234", "B0001", "U0100") */
export function isValidDTCCode(code: string): boolean {
  return /^[PCBU][0-3][0-9A-F]{3}$/i.test(code.trim());
}

/** Validates a VIN (Vehicle Identification Number) */
export function isValidVIN(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin.trim());
}

/** Validates baud rate */
export function isValidBaudRate(baudRate: number): boolean {
  const validRates = [9600, 19200, 38400, 57600, 115200];
  return validRates.includes(baudRate);
}

/** Validates a port path (e.g. "/dev/ttyUSB0", "COM3") */
export function isValidPortPath(port: string): boolean {
  const linuxPattern = /^\/dev\/tty[A-Za-z0-9]+$/;
  const windowsPattern = /^COM\d+$/i;
  return linuxPattern.test(port) || windowsPattern.test(port);
}

/** Validates a JWT token format (does NOT verify signature) */
export function isValidJWTFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(p => /^[A-Za-z0-9+/=_-]+$/.test(p));
}

/** Sanitizes a hex string by removing spaces and uppercasing */
export function sanitizeHex(hex: string): string {
  return hex.replace(/\s+/g, '').toUpperCase();
}

/** Validates an email address */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validates password strength (min 8 chars, upper, lower, number) */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

/** Clamps a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
