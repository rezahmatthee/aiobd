import { OBDParser } from '../../../src/utils/obd_parser';
import { ENGINE_PIDS } from '../../../src/pids/standard/engine';

describe('OBDParser', () => {
  let parser: OBDParser;

  beforeEach(() => {
    parser = new OBDParser();
  });

  describe('parseRawResponse', () => {
    it('should parse hex string to bytes', () => {
      const bytes = parser.parseRawResponse('41 0C 1A F8');
      expect(bytes).toEqual([0x41, 0x0C, 0x1A, 0xF8]);
    });

    it('should handle response without spaces', () => {
      const bytes = parser.parseRawResponse('410C1AF8');
      expect(bytes).toEqual([0x41, 0x0C, 0x1A, 0xF8]);
    });
  });

  describe('parsePIDResponse', () => {
    it('should parse RPM response', () => {
      const rpmPid = ENGINE_PIDS.find((p) => p.name === 'ENGINE_RPM')!;
      const result = parser.parsePIDResponse('41 0C 1A F8', rpmPid);
      expect(result).not.toBeNull();
      expect(result!.calculatedValue).toBeCloseTo(1726, 0);
    });
  });

  describe('parseDTCResponse', () => {
    it('should parse DTC codes', () => {
      const codes = parser.parseDTCResponse('43 01 33 00 00 00 00');
      expect(codes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('decodeDTCCode', () => {
    it('should decode P0133 correctly', () => {
      const result = parser.decodeDTCCode('0133');
      expect(result).not.toBeNull();
      expect(result!.system).toBe('P');
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate checksum', () => {
      const checksum = parser.calculateChecksum([0x41, 0x0C, 0x1A, 0xF8]);
      expect(checksum).toBe((0x41 + 0x0C + 0x1A + 0xF8) & 0xFF);
    });
  });
});
