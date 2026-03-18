"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProtocol = void 0;
const protocol_1 = require("../../types/protocol");
const logger_1 = require("../../utils/logger");
class BaseProtocol {
    constructor(config = {}) {
        this.status = protocol_1.ProtocolStatus.DISCONNECTED;
        this.config = {
            baudRate: 9600,
            timeout: 5000,
            retries: 3,
            headerEnabled: false,
            ...config,
        };
    }
    isConnected() {
        return this.status === protocol_1.ProtocolStatus.CONNECTED;
    }
    buildRequest(mode, pid) {
        return `${mode.toString(16).padStart(2, '0').toUpperCase()}${pid.toString(16).padStart(2, '0').toUpperCase()}`;
    }
    validateResponse(raw) {
        if (!raw || raw.trim() === '')
            return false;
        const errorResponses = ['NO DATA', 'ERROR', 'UNABLE TO CONNECT', 'BUS BUSY', '?'];
        return !errorResponses.some((err) => raw.toUpperCase().includes(err));
    }
    hexToBytes(hex) {
        const clean = hex.replace(/\s+/g, '');
        const bytes = [];
        for (let i = 0; i < clean.length; i += 2) {
            bytes.push(parseInt(clean.substring(i, i + 2), 16));
        }
        return bytes;
    }
    setStatus(status) {
        this.status = status;
        logger_1.logger.debug(`Protocol ${this.type} status changed to ${status}`);
    }
    buildFrame(mode, pid) {
        const data = Buffer.from([mode, pid]);
        return {
            header: Buffer.alloc(0),
            data,
            raw: data,
        };
    }
}
exports.BaseProtocol = BaseProtocol;
//# sourceMappingURL=base.js.map