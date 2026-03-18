import { PIDDefinition, PIDValue } from '../types/pid';
import { DTCCode } from '../types/diagnostic';
import { logger } from './logger';

export class OBDParser {
  parseRawResponse(raw: string): number[] {
    const cleaned = raw.replace(/\s+/g, '');
    const bytes: number[] = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      const byte = parseInt(cleaned.substring(i, i + 2), 16);
      if (!isNaN(byte)) bytes.push(byte);
    }
    return bytes;
  }

  parsePIDResponse(raw: string, pid: PIDDefinition): PIDValue | null {
    try {
      const parts = raw.trim().split(/\s+/);
      // Response format: [mode+0x40] [pid] [data bytes...]
      const dataBytes = parts.slice(2).map((b) => parseInt(b, 16));
      const calculatedValue = pid.formula(dataBytes);
      return {
        pid,
        rawValue: dataBytes,
        calculatedValue,
        unit: pid.unit,
        timestamp: new Date(),
      };
    } catch (err) {
      logger.error('Error parsing PID response', { raw, error: err });
      return null;
    }
  }

  parseDTCResponse(raw: string): DTCCode[] {
    const dtcs: DTCCode[] = [];
    const cleaned = raw.replace(/\s+/g, '');
    for (let i = 0; i < cleaned.length; i += 4) {
      const code = cleaned.substring(i, i + 4);
      if (code.length === 4 && code !== '0000') {
        const parsed = this.decodeDTCCode(code);
        if (parsed) dtcs.push(parsed);
      }
    }
    return dtcs;
  }

  decodeDTCCode(hex: string): DTCCode | null {
    if (hex.length !== 4) return null;
    const firstByte = parseInt(hex.substring(0, 2), 16);
    const system = this.getDTCSystem(firstByte >> 6);
    const digit1 = (firstByte >> 4) & 0x3;
    const digit2 = firstByte & 0xF;
    const digit3 = parseInt(hex[2], 16);
    const digit4 = parseInt(hex[3], 16);
    const code = `${system}${digit1}${digit2}${digit3.toString(16).toUpperCase()}${digit4.toString(16).toUpperCase()}`;
    return {
      code,
      description: `Diagnostic Trouble Code ${code}`,
      system: system as 'P' | 'C' | 'B' | 'U',
      type: 'stored',
    };
  }

  private getDTCSystem(bits: number): string {
    switch (bits) {
      case 0: return 'P';
      case 1: return 'C';
      case 2: return 'B';
      case 3: return 'U';
      default: return 'P';
    }
  }

  parseVIN(raw: string): string {
    const parts = raw.trim().split(/\s+/);
    // VIN is returned over multiple frames
    const vinBytes = parts.slice(2).map((b) => String.fromCharCode(parseInt(b, 16)));
    return vinBytes.join('').replace(/[^\x20-\x7E]/g, '');
  }

  calculateChecksum(bytes: number[]): number {
    return bytes.reduce((sum, byte) => sum + byte, 0) & 0xFF;
  }
}

export const obdParser = new OBDParser();
