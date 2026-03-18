/**
 * Unit Tests for Advanced Parser
 * Tests Mode $06, Mode $09, and freeze frame parsing
 */

import {
  parseHexResponse,
  decodeMode06Responses,
  decodeMode09Responses,
  decodeFreezeFrameResponse,
  validateCRC,
  calculateCRC,
  reassembleMultiFrame,
} from '../../src/utils/advanced_parser';
import { MonitorType } from '../../src/pids/advanced/mode_06';
import { VehicleInfoType } from '../../src/pids/advanced/mode_09';

describe('parseHexResponse', () => {
  it('should parse a valid hex response string', () => {
    const result = parseHexResponse('46 01 03 4B 00 FF 00 FF');
    expect(result).not.toBeNull();
    expect(result!.mode).toBe(6);
    expect(result!.pid).toBe(0x01);
    expect(result!.bytes).toEqual([0x03, 0x4b, 0x00, 0xff, 0x00, 0xff]);
  });

  it('should return null for invalid hex string', () => {
    expect(parseHexResponse('ZZ ZZ')).toBeNull();
    expect(parseHexResponse('')).toBeNull();
    expect(parseHexResponse('46')).toBeNull();
  });

  it('should handle hex strings without spaces', () => {
    const result = parseHexResponse('4601034B00FF00FF');
    expect(result).not.toBeNull();
    expect(result!.mode).toBe(6);
  });

  it('should parse Mode $09 response correctly', () => {
    const result = parseHexResponse('49 02 01 31 47 31 46 42 33 4B 33 35 39 42 33 30 37 38 39 36');
    expect(result).not.toBeNull();
    expect(result!.mode).toBe(9);
    expect(result!.pid).toBe(VehicleInfoType.VIN);
  });
});

describe('decodeMode06Responses', () => {
  it('should decode oxygen sensor monitor test result', () => {
    // Mode $06 response: testId=0x01, componentId=0x01, value=843, min=75, max=255
    // Format: [mode+0x40=0x46][testId=0x01][componentId=0x01][value_hi=0x03][value_lo=0x4B][min_hi=0x00][min_lo=0x4B][max_hi=0x00][max_lo=0xFF]
    const hexResponses = ['46 01 01 03 4B 00 4B 00 FF'];
    const results = decodeMode06Responses(hexResponses);
    expect(results).toHaveLength(1);
    expect(results[0].testId).toBe(0x01);
    expect(results[0].monitorType).toBe(MonitorType.OXYGEN_SENSOR);
    expect(results[0].testValue).toBe(843);
  });

  it('should decode catalyst monitor test result', () => {
    const hexResponses = ['46 0B 01 00 72 00 14 00 FF'];
    const results = decodeMode06Responses(hexResponses);
    expect(results).toHaveLength(1);
    expect(results[0].testId).toBe(0x0B);
    expect(results[0].monitorType).toBe(MonitorType.CATALYST);
  });

  it('should filter out non-Mode $06 responses', () => {
    const hexResponses = ['41 0C 0B B8', '46 01 01 03 4B 00 4B 00 FF'];
    const results = decodeMode06Responses(hexResponses);
    expect(results).toHaveLength(1);
  });

  it('should return empty array for empty input', () => {
    expect(decodeMode06Responses([])).toEqual([]);
  });
});

describe('decodeMode09Responses', () => {
  it('should decode VIN from Mode $09 response', () => {
    // "1G1FB3K359B307896" as ASCII bytes after message count byte
    const vinHex = '49 02 01 31 47 31 46 42 33 4B 33 35 39 42 33 30 37 38 39 36';
    const result = decodeMode09Responses([vinHex]);
    expect(result.vin).toBe('1G1FB3K359B307896');
  });

  it('should decode Calibration ID', () => {
    // "ACDE12345678" as ASCII bytes
    const calIdHex = '49 04 01 41 43 44 45 31 32 33 34 35 36 37 38';
    const result = decodeMode09Responses([calIdHex]);
    expect(result.calibrationId).toBe('ACDE12345678');
  });

  it('should decode CVN (4 bytes as hex string)', () => {
    const cvnHex = '49 06 01 12 34 56 78';
    const result = decodeMode09Responses([cvnHex]);
    expect(result.cvn).toBe('12345678');
  });

  it('should decode ECU name', () => {
    // "PCM ECU v1.0" as ASCII bytes
    const ecuHex = '49 0A 01 50 43 4D 20 45 43 55 20 76 31 2E 30';
    const result = decodeMode09Responses([ecuHex]);
    expect(result.ecuName).toBe('PCM ECU v1.0');
  });

  it('should handle multiple responses at once', () => {
    const hexResponses = [
      '49 02 01 31 47 31 46 42 33 4B 33 35 39 42 33 30 37 38 39 36',
      '49 06 01 12 34 56 78',
    ];
    const result = decodeMode09Responses(hexResponses);
    expect(result.vin).toBeDefined();
    expect(result.cvn).toBeDefined();
  });
});

describe('decodeFreezeFrameResponse', () => {
  it('should decode a valid freeze frame hex response', () => {
    // DTC P0300 = 0x43 0x00 (P=01 prefix, 0300)
    // P0300: highByte=0x03, lowByte=0x00
    const hexResponse = '03 00 04 78 05 5A';
    const result = decodeFreezeFrameResponse('vehicle1', 'frame1', hexResponse);
    expect(result).not.toBeNull();
    expect(result!.vehicleId).toBe('vehicle1');
    expect(result!.frameId).toBe('frame1');
  });

  it('should return null for too-short response', () => {
    expect(decodeFreezeFrameResponse('v1', 'f1', '03')).toBeNull();
  });

  it('should return null for invalid hex', () => {
    expect(decodeFreezeFrameResponse('v1', 'f1', 'ZZ ZZ ZZ')).toBeNull();
  });
});

describe('validateCRC', () => {
  it('should validate correct CRC', () => {
    const data = [0x01, 0x02, 0x03];
    const crc = calculateCRC(data);
    expect(validateCRC([...data, crc])).toBe(true);
  });

  it('should reject incorrect CRC', () => {
    expect(validateCRC([0x01, 0x02, 0x03, 0xFF])).toBe(false);
  });

  it('should reject bytes array that is too short', () => {
    expect(validateCRC([0x00])).toBe(false);
  });
});

describe('calculateCRC', () => {
  it('should calculate XOR checksum', () => {
    expect(calculateCRC([0x01, 0x02, 0x03])).toBe(0x01 ^ 0x02 ^ 0x03);
  });

  it('should return 0 for empty array', () => {
    expect(calculateCRC([])).toBe(0);
  });
});

describe('reassembleMultiFrame', () => {
  it('should return single frame as-is', () => {
    const frame = [0x01, 0x02, 0x03];
    expect(reassembleMultiFrame([frame])).toEqual(frame);
  });

  it('should reassemble first frame + consecutive frames', () => {
    const firstFrame = [0x10, 0x0E, 0x49, 0x02, 0x01, 0x31, 0x47];
    const consecutiveFrame = [0x21, 0x31, 0x46, 0x42, 0x33, 0x4B, 0x33];
    const result = reassembleMultiFrame([firstFrame, consecutiveFrame]);
    // First frame: skip first 2 bytes -> [0x49, 0x02, 0x01, 0x31, 0x47]
    // CF: skip first byte -> [0x31, 0x46, 0x42, 0x33, 0x4B, 0x33]
    expect(result).toEqual([0x49, 0x02, 0x01, 0x31, 0x47, 0x31, 0x46, 0x42, 0x33, 0x4B, 0x33]);
  });

  it('should return empty array for empty input', () => {
    expect(reassembleMultiFrame([])).toEqual([]);
  });
});
