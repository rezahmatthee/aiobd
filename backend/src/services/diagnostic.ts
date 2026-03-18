import { DiagnosticSession, DiagnosticSessionStatus, DTCCode } from '../types/diagnostic';
import { ProtocolType } from '../types/protocol';
import { PIDValue } from '../types/pid';
import { createProtocol } from '../core';
import { obdParser } from '../utils/obd_parser';
import { findPID } from '../pids/standard';
import { logger } from '../utils/logger';

export class DiagnosticService {
  private activeSessions: Map<string, DiagnosticSession> = new Map();

  createSession(vehicleId: string, protocol: ProtocolType): DiagnosticSession {
    const session: DiagnosticSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      vehicleId,
      protocol,
      status: DiagnosticSessionStatus.IDLE,
      startedAt: new Date(),
      pidValues: [],
      dtcCodes: [],
      freezeFrames: [],
    };
    this.activeSessions.set(session.id, session);
    logger.info(`Created diagnostic session ${session.id} for vehicle ${vehicleId}`);
    return session;
  }

  async startSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    const protocol = createProtocol(session.protocol);
    await protocol.connect();
    session.status = DiagnosticSessionStatus.ACTIVE;
    logger.info(`Started session ${sessionId}`);
  }

  async readPID(sessionId: string, mode: number, pid: number): Promise<PIDValue | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== DiagnosticSessionStatus.ACTIVE) {
      throw new Error('Session not active');
    }
    const pidDef = findPID(mode, pid);
    if (!pidDef) {
      logger.warn(`Unknown PID: mode=${mode}, pid=${pid}`);
      return null;
    }
    const protocol = createProtocol(session.protocol);
    const response = await protocol.sendRequest(mode, pid);
    if (!response.success || !response.raw) return null;
    const pidValue = obdParser.parsePIDResponse(response.raw, pidDef);
    if (pidValue) {
      session.pidValues.push(pidValue);
    }
    return pidValue;
  }

  async readDTCCodes(sessionId: string): Promise<DTCCode[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    const protocol = createProtocol(session.protocol);
    const response = await protocol.sendRequest(0x03, 0x00);
    if (!response.success || !response.raw) return [];
    const codes = obdParser.parseDTCResponse(response.raw);
    session.dtcCodes = codes;
    return codes;
  }

  endSession(sessionId: string): DiagnosticSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    session.status = DiagnosticSessionStatus.COMPLETED;
    session.endedAt = new Date();
    this.activeSessions.delete(sessionId);
    logger.info(`Ended session ${sessionId}`);
    return session;
  }

  getSession(sessionId: string): DiagnosticSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

export const diagnosticService = new DiagnosticService();
