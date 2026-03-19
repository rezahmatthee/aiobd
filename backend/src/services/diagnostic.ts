import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';
import {
  DiagnosticSession,
  DTCCode,
  FreezeFrameData,
  PIDReading,
  SessionStatus,
  ProtocolType,
  DTCCategory,
  DTCSeverity,
  OBD2Service,
} from '../types';

function makeId(): string {
  return randomBytes(8).toString('hex');
}

function nowStr(): string {
  return new Date().toISOString();
}

const sessions = new Map<string, DiagnosticSession>();

export class DiagnosticService extends EventEmitter {
  async startSession(vehicleId: string, userId: string): Promise<DiagnosticSession> {
    const session: DiagnosticSession = {
      id: makeId(),
      userId,
      vehicleId,
      protocol: ProtocolType.AUTO,
      status: SessionStatus.CONNECTING,
      startedAt: new Date(),
      dtcs: [],
      readings: [],
      metadata: {},
    };
    sessions.set(session.id, session);

    // Simulate connection
    await new Promise((r) => setTimeout(r, 50));
    session.status = SessionStatus.ACTIVE;
    this.emit('sessionStarted', session);
    return session;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.requireSession(sessionId);
    session.status = SessionStatus.COMPLETED;
    session.endedAt = new Date();
    sessions.delete(sessionId);
    this.emit('sessionEnded', { sessionId });
  }

  async readPID(sessionId: string, pid: number): Promise<number | string> {
    this.requireSession(sessionId);
    await new Promise((r) => setTimeout(r, 10));
    // Simulated PID values
    const simulatedValues: Record<number, number> = {
      0x0C: 800 + Math.random() * 400,  // RPM
      0x0D: Math.random() * 60,          // speed
      0x05: 80 + Math.random() * 20,     // coolant temp
      0x04: 10 + Math.random() * 30,     // engine load
      0x0F: 20 + Math.random() * 15,     // IAT
      0x11: Math.random() * 20,          // throttle
    };
    return simulatedValues[pid] ?? Math.random() * 100;
  }

  async readDTCs(sessionId: string): Promise<DTCCode[]> {
    this.requireSession(sessionId);
    await new Promise((r) => setTimeout(r, 30));
    // Return simulated empty DTC list
    return [];
  }

  async clearDTCs(sessionId: string): Promise<void> {
    const session = this.requireSession(sessionId);
    await new Promise((r) => setTimeout(r, 20));
    session.dtcs = [];
    this.emit('dtcsCleared', { sessionId });
  }

  async readFreezeFrame(sessionId: string): Promise<FreezeFrameData> {
    this.requireSession(sessionId);
    await new Promise((r) => setTimeout(r, 30));

    const reading: PIDReading = {
      pid: 0x0C,
      service: OBD2Service.FREEZE_FRAME,
      name: 'Engine RPM',
      value: 1200,
      unit: 'RPM',
      rawBytes: '12C0',
      timestamp: new Date(),
      valid: true,
    };

    return {
      dtc: 'P0000',
      frameNumber: 0,
      readings: [reading],
      timestamp: new Date(),
    };
  }

  startLiveStream(sessionId: string): EventEmitter {
    const session = this.requireSession(sessionId);
    session.status = SessionStatus.RECORDING;
    const stream = new EventEmitter();

    const interval = setInterval(async () => {
      try {
        const rpm = await this.readPID(sessionId, 0x0C);
        const speed = await this.readPID(sessionId, 0x0D);
        stream.emit('data', { rpm, speed, timestamp: nowStr() });
      } catch {
        clearInterval(interval);
        stream.emit('end');
      }
    }, 100);

    stream.on('stop', () => {
      clearInterval(interval);
      session.status = SessionStatus.ACTIVE;
    });

    return stream;
  }

  async switchProtocol(sessionId: string, protocolType: ProtocolType): Promise<void> {
    const session = this.requireSession(sessionId);
    await new Promise((r) => setTimeout(r, 20));
    session.protocol = protocolType;
    this.emit('protocolSwitched', { sessionId, protocolType });
  }

  private requireSession(sessionId: string): DiagnosticSession {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Diagnostic session ${sessionId} not found`);
    return session;
  }
}

// Export simulated DTC categories for use in controllers
export { DTCCategory, DTCSeverity };
