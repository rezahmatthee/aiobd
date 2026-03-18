import { createProtocol } from '../../src/core';
import { ProtocolType, ProtocolStatus } from '../../src/types/protocol';

describe('Protocol switching', () => {
  it('should create all protocol types', () => {
    const types = [
      ProtocolType.SAE_J1850_PWM,
      ProtocolType.SAE_J1850_VPW,
      ProtocolType.ISO_9141_2,
      ProtocolType.ISO_14230,
      ProtocolType.ISO_15765,
      ProtocolType.ISO_27145,
    ];
    for (const type of types) {
      const protocol = createProtocol(type);
      expect(protocol.type).toBe(type);
      expect(protocol.status).toBe(ProtocolStatus.DISCONNECTED);
    }
  });

  it('should switch between protocols', async () => {
    const p1 = createProtocol(ProtocolType.ISO_15765);
    await p1.connect();
    expect(p1.isConnected()).toBe(true);
    await p1.disconnect();
    expect(p1.isConnected()).toBe(false);

    const p2 = createProtocol(ProtocolType.ISO_14230);
    await p2.connect();
    expect(p2.isConnected()).toBe(true);
  });

  it('should fall back to ISO 15765 for AUTO type', () => {
    const p = createProtocol(ProtocolType.AUTO);
    expect(p.type).toBe(ProtocolType.ISO_15765);
  });
});
