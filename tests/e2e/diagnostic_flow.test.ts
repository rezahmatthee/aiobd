/**
 * E2E test for complete diagnostic flow
 * These tests simulate a complete diagnostic session from connection to data retrieval
 */

import { createProtocol } from '../../backend/src/core';
import { DiagnosticService } from '../../backend/src/services/diagnostic';
import { ProtocolType, ProtocolStatus } from '../../backend/src/types/protocol';
import { DiagnosticSessionStatus } from '../../backend/src/types/diagnostic';
import { OBDParser } from '../../backend/src/utils/obd_parser';
import obdResponses from '../fixtures/obd_responses.json';

describe('Complete Diagnostic Flow', () => {
  let diagnosticService: DiagnosticService;

  beforeEach(() => {
    diagnosticService = new DiagnosticService();
  });

  describe('Protocol Layer', () => {
    it('should connect all 6 protocols', async () => {
      const protocols = [
        ProtocolType.SAE_J1850_PWM,
        ProtocolType.SAE_J1850_VPW,
        ProtocolType.ISO_9141_2,
        ProtocolType.ISO_14230,
        ProtocolType.ISO_15765,
        ProtocolType.ISO_27145,
      ];

      for (const type of protocols) {
        const protocol = createProtocol(type);
        await protocol.connect();
        expect(protocol.status).toBe(ProtocolStatus.CONNECTED);
        await protocol.disconnect();
        expect(protocol.status).toBe(ProtocolStatus.DISCONNECTED);
      }
    });
  });

  describe('OBD Parser with Fixtures', () => {
    let parser: OBDParser;

    beforeEach(() => {
      parser = new OBDParser();
    });

    it('should correctly parse RPM fixture response', () => {
      const bytes = parser.parseRawResponse(obdResponses.rpm.response.replace('7E8 04 ', ''));
      expect(bytes.length).toBeGreaterThan(0);
    });

    it('should handle NO DATA response', () => {
      const bytes = parser.parseRawResponse(obdResponses.no_data.response);
      expect(bytes.length).toBe(0);
    });
  });

  describe('Diagnostic Session Lifecycle', () => {
    it('should complete a full session lifecycle', async () => {
      // Create session
      const session = diagnosticService.createSession('test-vehicle', ProtocolType.ISO_15765);
      expect(session.status).toBe(DiagnosticSessionStatus.IDLE);

      // Start session
      await diagnosticService.startSession(session.id);
      expect(diagnosticService.getSession(session.id)?.status).toBe(DiagnosticSessionStatus.ACTIVE);

      // Read DTC codes
      const codes = await diagnosticService.readDTCCodes(session.id);
      expect(Array.isArray(codes)).toBe(true);

      // End session
      const ended = diagnosticService.endSession(session.id);
      expect(ended?.status).toBe(DiagnosticSessionStatus.COMPLETED);
      expect(ended?.endedAt).toBeDefined();
    });
  });
});
