"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISO91412Protocol = void 0;
const protocol_1 = require("../../types/protocol");
const base_1 = require("./base");
class ISO91412Protocol extends base_1.BaseProtocol {
    constructor() {
        super({ baudRate: 10400, timeout: 5000 });
        this.type = protocol_1.ProtocolType.ISO_9141_2;
    }
    async connect() {
        this.setStatus(protocol_1.ProtocolStatus.CONNECTING);
        // ISO 9141-2: 5-baud initialization at 10.4 kbps
        // Send 0x33 at 5 baud, receive 0x55 sync byte, key bytes, then inverted key byte
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
        // ISO 9141-2 response format: 48 6B XX YY [data bytes] CC
        const parts = raw.trim().split(/\s+/);
        const dataBytes = parts.slice(3, -1).map((b) => parseInt(b, 16));
        return {
            success: true,
            data: Buffer.from(dataBytes),
            raw,
            timestamp: new Date(),
        };
    }
}
exports.ISO91412Protocol = ISO91412Protocol;
//# sourceMappingURL=iso_9141_2.js.map