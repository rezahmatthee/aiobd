"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISO14230Protocol = void 0;
const protocol_1 = require("../../types/protocol");
const base_1 = require("./base");
class ISO14230Protocol extends base_1.BaseProtocol {
    constructor() {
        super({ baudRate: 10400, timeout: 5000 });
        this.type = protocol_1.ProtocolType.ISO_14230;
    }
    async connect() {
        this.setStatus(protocol_1.ProtocolStatus.CONNECTING);
        // ISO 14230 (KWP2000): Fast init or 5-baud init
        // Fast init: pull K-line low for 25ms, high for 25ms
        this.setStatus(protocol_1.ProtocolStatus.CONNECTED);
    }
    async disconnect() {
        this.setStatus(protocol_1.ProtocolStatus.DISCONNECTED);
    }
    async sendRequest(mode, pid) {
        const request = this.buildRequest(mode, pid);
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
        // KWP2000 response: format byte, target, source, [length], service ID, data, checksum
        const parts = raw.trim().split(/\s+/);
        const dataBytes = parts.slice(4, -1).map((b) => parseInt(b, 16));
        return {
            success: true,
            data: Buffer.from(dataBytes),
            raw,
            timestamp: new Date(),
        };
    }
}
exports.ISO14230Protocol = ISO14230Protocol;
//# sourceMappingURL=iso_14230.js.map