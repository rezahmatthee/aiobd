import { SAEJ1850PWMProtocol } from '../../../src/core/protocols/sae_j1850_pwm';
import { SAEJ1850VPWProtocol } from '../../../src/core/protocols/sae_j1850_vpw';
import { ISO91412Protocol } from '../../../src/core/protocols/iso_9141_2';
import { ISO14230Protocol } from '../../../src/core/protocols/iso_14230';
import { ISO15765Protocol } from '../../../src/core/protocols/iso_15765';
import { ISO27145Protocol } from '../../../src/core/protocols/iso_27145';
import { ProtocolType, ProtocolStatus } from '../../../src/types/protocol';

describe('Protocol implementations', () => {
  describe('SAE J1850 PWM', () => {
    it('should have correct type', () => {
      const p = new SAEJ1850PWMProtocol();
      expect(p.type).toBe(ProtocolType.SAE_J1850_PWM);
    });

    it('should start disconnected', () => {
      const p = new SAEJ1850PWMProtocol();
      expect(p.status).toBe(ProtocolStatus.DISCONNECTED);
      expect(p.isConnected()).toBe(false);
    });

    it('should connect successfully', async () => {
      const p = new SAEJ1850PWMProtocol();
      await p.connect();
      expect(p.isConnected()).toBe(true);
    });

    it('should build correct request string', async () => {
      const p = new SAEJ1850PWMProtocol();
      const response = await p.sendRequest(0x01, 0x0C);
      expect(response.raw).toBe('010C');
    });

    it('should return error on invalid response', () => {
      const p = new SAEJ1850PWMProtocol();
      const result = p.parseResponse('NO DATA');
      expect(result.success).toBe(false);
    });
  });

  describe('SAE J1850 VPW', () => {
    it('should have correct type', () => {
      const p = new SAEJ1850VPWProtocol();
      expect(p.type).toBe(ProtocolType.SAE_J1850_VPW);
    });
    it('should connect and disconnect', async () => {
      const p = new SAEJ1850VPWProtocol();
      await p.connect();
      expect(p.isConnected()).toBe(true);
      await p.disconnect();
      expect(p.isConnected()).toBe(false);
    });
  });

  describe('ISO 9141-2', () => {
    it('should have correct type', () => {
      const p = new ISO91412Protocol();
      expect(p.type).toBe(ProtocolType.ISO_9141_2);
    });
    it('should connect successfully', async () => {
      const p = new ISO91412Protocol();
      await p.connect();
      expect(p.isConnected()).toBe(true);
    });
  });

  describe('ISO 14230', () => {
    it('should have correct type', () => {
      const p = new ISO14230Protocol();
      expect(p.type).toBe(ProtocolType.ISO_14230);
    });
    it('should connect and send request', async () => {
      const p = new ISO14230Protocol();
      await p.connect();
      const resp = await p.sendRequest(0x01, 0x05);
      expect(resp.success).toBe(true);
    });
  });

  describe('ISO 15765 (CAN)', () => {
    it('should have correct type', () => {
      const p = new ISO15765Protocol();
      expect(p.type).toBe(ProtocolType.ISO_15765);
    });
    it('should build CAN frame request', async () => {
      const p = new ISO15765Protocol();
      const resp = await p.sendRequest(0x01, 0x0C);
      expect(resp.raw).toContain('7DF');
    });
    it('should parse valid CAN response', () => {
      const p = new ISO15765Protocol();
      const result = p.parseResponse('7E8 04 41 0C 1A F8 00 00');
      expect(result.success).toBe(true);
    });
  });

  describe('ISO 27145 (WWH-OBD)', () => {
    it('should have correct type', () => {
      const p = new ISO27145Protocol();
      expect(p.type).toBe(ProtocolType.ISO_27145);
    });
    it('should build UDS request', async () => {
      const p = new ISO27145Protocol();
      const resp = await p.sendRequest(0x22, 0x0110);
      expect(resp.raw).toContain('22');
    });
  });
});
