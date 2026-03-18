"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISO27145Protocol = void 0;
const protocol_1 = require("../../types/protocol");
const base_1 = require("./base");
class ISO27145Protocol extends base_1.BaseProtocol {
    constructor() {
        super({ baudRate: 500000, timeout: 5000, headerEnabled: true });
        this.type = protocol_1.ProtocolType.ISO_27145;
    }
    async connect() {
        this.setStatus(protocol_1.ProtocolStatus.CONNECTING);
        // ISO 27145 (WWH-OBD): World Wide Harmonized OBD
        // Built on ISO 15765-4 CAN and ISO 14229 UDS
        this.setStatus(protocol_1.ProtocolStatus.CONNECTED);
    }
    async disconnect() {
        this.setStatus(protocol_1.ProtocolStatus.DISCONNECTED);
    }
    async sendRequest(mode, pid) {
        // WWH-OBD uses UDS service 0x22 ReadDataByIdentifier
        const request = `22 ${pid.toString(16).padStart(4, '0').toUpperCase()}`;
        return {
            success: true,
            raw: request,
            timestamp: new Date(),
        };
    }
    parseResponse(raw) {
        if (!this.validateResponse(raw)) {
            return { success: false, error: 'Invalid response', timestamp: new Date() };
        }
        const parts = raw.trim().split(/\s+/);
        // UDS positive response: 62 [identifier high] [identifier low] [data bytes]
        const dataBytes = parts.slice(3).map((b) => parseInt(b, 16));
        return {
            success: true,
            data: Buffer.from(dataBytes),
            raw,
            timestamp: new Date(),
        };
    }
}
exports.ISO27145Protocol = ISO27145Protocol;
//# sourceMappingURL=iso_27145.js.map