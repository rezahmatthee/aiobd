"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISO15765Protocol = void 0;
const protocol_1 = require("../../types/protocol");
const base_1 = require("./base");
class ISO15765Protocol extends base_1.BaseProtocol {
    constructor(config = {}) {
        super({
            baudRate: 500000,
            timeout: 5000,
            headerEnabled: true,
            canId: 0x7DF,
            ...config,
        });
        this.type = protocol_1.ProtocolType.ISO_15765;
    }
    async connect() {
        this.setStatus(protocol_1.ProtocolStatus.CONNECTING);
        // ISO 15765 CAN bus: 500 kbps (or 250 kbps for older vehicles)
        // Uses 11-bit or 29-bit CAN identifiers
        this.setStatus(protocol_1.ProtocolStatus.CONNECTED);
    }
    async disconnect() {
        this.setStatus(protocol_1.ProtocolStatus.DISCONNECTED);
    }
    async sendRequest(mode, pid) {
        // CAN frame: 7DF 02 01 XX 00 00 00 00
        const canFrame = `${(this.config.canId || 0x7DF).toString(16).toUpperCase().padStart(3, '0')} 02 ${mode.toString(16).padStart(2, '0').toUpperCase()} ${pid.toString(16).padStart(2, '0').toUpperCase()} 00 00 00 00`;
        return {
            success: true,
            raw: canFrame,
            timestamp: new Date(),
        };
    }
    parseResponse(raw) {
        if (!this.validateResponse(raw)) {
            return { success: false, error: 'Invalid response', timestamp: new Date() };
        }
        // CAN response: 7E8 04 41 XX [data bytes] 00 00 00
        const parts = raw.trim().split(/\s+/);
        const dataLength = parseInt(parts[1], 16);
        const dataBytes = parts.slice(4, 4 + dataLength - 2).map((b) => parseInt(b, 16));
        return {
            success: true,
            data: Buffer.from(dataBytes),
            raw,
            timestamp: new Date(),
        };
    }
}
exports.ISO15765Protocol = ISO15765Protocol;
//# sourceMappingURL=iso_15765.js.map