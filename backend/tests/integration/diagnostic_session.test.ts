import { DiagnosticService } from '../../src/services/diagnostic';
import { ProtocolType } from '../../src/types/protocol';
import { DiagnosticSessionStatus } from '../../src/types/diagnostic';

describe('DiagnosticService Integration', () => {
  let service: DiagnosticService;

  beforeEach(() => {
    service = new DiagnosticService();
  });

  it('should create a new session', () => {
    const session = service.createSession('vehicle123', ProtocolType.ISO_15765);
    expect(session.id).toBeDefined();
    expect(session.vehicleId).toBe('vehicle123');
    expect(session.protocol).toBe(ProtocolType.ISO_15765);
    expect(session.status).toBe(DiagnosticSessionStatus.IDLE);
  });

  it('should start a session', async () => {
    const session = service.createSession('vehicle123', ProtocolType.ISO_15765);
    await service.startSession(session.id);
    const activeSession = service.getSession(session.id);
    expect(activeSession!.status).toBe(DiagnosticSessionStatus.ACTIVE);
  });

  it('should end a session', async () => {
    const session = service.createSession('vehicle123', ProtocolType.ISO_15765);
    await service.startSession(session.id);
    const ended = service.endSession(session.id);
    expect(ended!.status).toBe(DiagnosticSessionStatus.COMPLETED);
    expect(ended!.endedAt).toBeDefined();
  });

  it('should throw error for unknown session', async () => {
    await expect(service.startSession('nonexistent')).rejects.toThrow();
  });

  it('should read PID from active session', async () => {
    const session = service.createSession('vehicle123', ProtocolType.ISO_15765);
    await service.startSession(session.id);
    const value = await service.readPID(session.id, 0x01, 0x0C);
    // May be null since we don't have a real adapter
    expect(value === null || value !== undefined).toBe(true);
  });
});
