"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnosticService = exports.DiagnosticService = void 0;
const diagnostic_1 = require("../types/diagnostic");
const core_1 = require("../core");
const obd_parser_1 = require("../utils/obd_parser");
const standard_1 = require("../pids/standard");
const logger_1 = require("../utils/logger");
class DiagnosticService {
    constructor() {
        this.activeSessions = new Map();
    }
    createSession(vehicleId, protocol) {
        const session = {
            id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            vehicleId,
            protocol,
            status: diagnostic_1.DiagnosticSessionStatus.IDLE,
            startedAt: new Date(),
            pidValues: [],
            dtcCodes: [],
            freezeFrames: [],
        };
        this.activeSessions.set(session.id, session);
        logger_1.logger.info(`Created diagnostic session ${session.id} for vehicle ${vehicleId}`);
        return session;
    }
    async startSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            throw new Error(`Session ${sessionId} not found`);
        const protocol = (0, core_1.createProtocol)(session.protocol);
        await protocol.connect();
        session.status = diagnostic_1.DiagnosticSessionStatus.ACTIVE;
        logger_1.logger.info(`Started session ${sessionId}`);
    }
    async readPID(sessionId, mode, pid) {
        const session = this.activeSessions.get(sessionId);
        if (!session || session.status !== diagnostic_1.DiagnosticSessionStatus.ACTIVE) {
            throw new Error('Session not active');
        }
        const pidDef = (0, standard_1.findPID)(mode, pid);
        if (!pidDef) {
            logger_1.logger.warn(`Unknown PID: mode=${mode}, pid=${pid}`);
            return null;
        }
        const protocol = (0, core_1.createProtocol)(session.protocol);
        const response = await protocol.sendRequest(mode, pid);
        if (!response.success || !response.raw)
            return null;
        const pidValue = obd_parser_1.obdParser.parsePIDResponse(response.raw, pidDef);
        if (pidValue) {
            session.pidValues.push(pidValue);
        }
        return pidValue;
    }
    async readDTCCodes(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            throw new Error(`Session ${sessionId} not found`);
        const protocol = (0, core_1.createProtocol)(session.protocol);
        const response = await protocol.sendRequest(0x03, 0x00);
        if (!response.success || !response.raw)
            return [];
        const codes = obd_parser_1.obdParser.parseDTCResponse(response.raw);
        session.dtcCodes = codes;
        return codes;
    }
    endSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return null;
        session.status = diagnostic_1.DiagnosticSessionStatus.COMPLETED;
        session.endedAt = new Date();
        this.activeSessions.delete(sessionId);
        logger_1.logger.info(`Ended session ${sessionId}`);
        return session;
    }
    getSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }
}
exports.DiagnosticService = DiagnosticService;
exports.diagnosticService = new DiagnosticService();
//# sourceMappingURL=diagnostic.js.map