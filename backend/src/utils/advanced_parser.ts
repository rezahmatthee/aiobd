/**
 * Advanced Parser - Utilities for parsing OBD2 Mode $06/$09 and freeze frame data
 */

import { parseMode06Response, MonitorTestResult } from '../pids/advanced/mode_06';
import {
  parseVIN,
  parseCalibrationId,
  parseCVN,
  parseECUName,
  VehicleInfoType,
  VehicleInfo,
} from '../pids/advanced/mode_09';
import { parseFreezeFrameResponse, FreezeFrame } from '../pids/advanced/freeze_frames';

export interface ParsedHexResponse {
  mode: number;
  pid: number;
  bytes: number[];
}

/**
 * Parse a hex OBD2 response string into bytes
 * Example: "46 01 34 AB" -> [0x46, 0x01, 0x34, 0xAB]
 */
export function parseHexResponse(hexString: string): ParsedHexResponse | null {
  const cleaned = hexString.replace(/\s+/g, '').replace(/\r/g, '');

  if (cleaned.length < 4 || cleaned.length % 2 !== 0) {
    return null;
  }

  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = parseInt(cleaned.slice(i, i + 2), 16);
    if (isNaN(byte)) return null;
    bytes.push(byte);
  }

  if (bytes.length < 2) return null;

  // Mode response byte is mode + 0x40
  const modeResponse = bytes[0];
  const mode = modeResponse - 0x40;
  const pid = bytes[1];

  return {
    mode,
    pid,
    bytes: bytes.slice(2),
  };
}

/**
 * Parse multiple Mode $06 hex responses
 */
export function decodeMode06Responses(hexResponses: string[]): MonitorTestResult[] {
  const results: MonitorTestResult[] = [];

  for (const hexResponse of hexResponses) {
    const parsed = parseHexResponse(hexResponse);
    if (!parsed || parsed.mode !== 6) continue;

    // Each mode 06 response has: test ID, component ID, value (2 bytes), min (2 bytes), max (2 bytes)
    const allBytes = [parsed.pid, ...parsed.bytes];
    const testResult = parseMode06Response(allBytes);
    if (testResult) {
      results.push(testResult);
    }
  }

  return results;
}

/**
 * Decode Mode $09 hex responses into VehicleInfo
 */
export function decodeMode09Responses(hexResponses: string[]): Partial<VehicleInfo> {
  const info: Partial<VehicleInfo> = { rawResponses: {} };

  for (const hexResponse of hexResponses) {
    const parsed = parseHexResponse(hexResponse);
    if (!parsed || parsed.mode !== 9) continue;

    const infoType = parsed.pid as VehicleInfoType;
    const bytes = parsed.bytes;

    if (info.rawResponses) {
      info.rawResponses[infoType] = bytes;
    }

    switch (infoType) {
      case VehicleInfoType.VIN:
        info.vin = parseVIN(bytes);
        break;
      case VehicleInfoType.CALIBRATION_ID:
        info.calibrationId = parseCalibrationId(bytes);
        break;
      case VehicleInfoType.CVN:
        info.cvn = parseCVN(bytes);
        break;
      case VehicleInfoType.ECU_NAME:
        info.ecuName = parseECUName(bytes);
        break;
    }
  }

  return info;
}

/**
 * Decode a freeze frame hex response
 */
export function decodeFreezeFrameResponse(
  vehicleId: string,
  frameId: string,
  hexResponse: string
): FreezeFrame | null {
  const cleaned = hexResponse.replace(/\s+/g, '').replace(/\r/g, '');
  if (cleaned.length % 2 !== 0) return null;

  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = parseInt(cleaned.slice(i, i + 2), 16);
    if (isNaN(byte)) return null;
    bytes.push(byte);
  }

  return parseFreezeFrameResponse(vehicleId, frameId, bytes);
}

/**
 * Validate CRC for OBD2 response
 * Simple XOR-based checksum validation
 */
export function validateCRC(bytes: number[]): boolean {
  if (bytes.length < 2) return false;

  const data = bytes.slice(0, -1);
  const expectedCRC = bytes[bytes.length - 1];
  const calculatedCRC = data.reduce((acc, byte) => acc ^ byte, 0);

  return calculatedCRC === expectedCRC;
}

/**
 * Calculate CRC for an OBD2 message
 */
export function calculateCRC(bytes: number[]): number {
  return bytes.reduce((acc, byte) => acc ^ byte, 0);
}

/**
 * Reassemble multi-frame ISO 15765-2 response
 * Handles First Frame (FF) and Consecutive Frames (CF)
 */
export function reassembleMultiFrame(frames: number[][]): number[] {
  if (frames.length === 0) return [];
  if (frames.length === 1) return frames[0];

  const assembled: number[] = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (i === 0) {
      // First frame: skip first 2 bytes (length indicator)
      assembled.push(...frame.slice(2));
    } else {
      // Consecutive frames: skip first byte (sequence number)
      assembled.push(...frame.slice(1));
    }
  }

  return assembled;
}
