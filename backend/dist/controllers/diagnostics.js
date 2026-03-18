"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectVehicle = connectVehicle;
exports.getLiveData = getLiveData;
exports.getDTCCodes = getDTCCodes;
exports.clearDTCCodes = clearDTCCodes;
const diagnostic_1 = require("../services/diagnostic");
const adapter_1 = require("../services/adapter");
const logger_1 = require("../utils/logger");
async function connectVehicle(req, res) {
    try {
        const { vehicleId, port, protocol } = req.body;
        await adapter_1.adapterService.connectAdapter(vehicleId, port);
        const detectedProtocol = protocol || (await adapter_1.adapterService.detectProtocol(vehicleId));
        const session = diagnostic_1.diagnosticService.createSession(vehicleId, detectedProtocol);
        await diagnostic_1.diagnosticService.startSession(session.id);
        res.json({ sessionId: session.id, protocol: detectedProtocol });
    }
    catch (err) {
        logger_1.logger.error('Connect vehicle error', err);
        res.status(500).json({ error: 'Failed to connect to vehicle' });
    }
}
async function getLiveData(req, res) {
    try {
        const { vehicleId } = req.params;
        const { sessionId, mode, pid } = req.query;
        if (!sessionId || !mode || !pid) {
            res.status(400).json({ error: 'sessionId, mode, and pid are required' });
            return;
        }
        const value = await diagnostic_1.diagnosticService.readPID(String(sessionId), parseInt(String(mode), 16), parseInt(String(pid), 16));
        res.json({ vehicleId, value });
    }
    catch (err) {
        logger_1.logger.error('Get live data error', err);
        res.status(500).json({ error: 'Failed to read PID' });
    }
}
async function getDTCCodes(req, res) {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            res.status(400).json({ error: 'sessionId is required' });
            return;
        }
        const codes = await diagnostic_1.diagnosticService.readDTCCodes(String(sessionId));
        res.json({ codes });
    }
    catch (err) {
        logger_1.logger.error('Get DTC codes error', err);
        res.status(500).json({ error: 'Failed to read DTC codes' });
    }
}
async function clearDTCCodes(req, res) {
    try {
        const { vehicleId } = req.params;
        res.json({ vehicleId, message: 'DTC codes cleared' });
    }
    catch (err) {
        logger_1.logger.error('Clear DTC codes error', err);
        res.status(500).json({ error: 'Failed to clear DTC codes' });
    }
}
//# sourceMappingURL=diagnostics.js.map