"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAEJ1850VPWProtocol = void 0;
const protocol_1 = require("../../types/protocol");
const base_1 = require("./base");
class SAEJ1850VPWProtocol extends base_1.BaseProtocol {
    constructor() {
        super({ baudRate: 10400, timeout: 5000 });
        this.type = protocol_1.ProtocolType.SAE_J1850_VPW;
    }
    async connect() {
        this.setStatus(protocol_1.ProtocolStatus.CONNECTING);
        // SAE J1850 VPW uses 10.4 kbps variable pulse width
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
        const bytes = this.hexToBytes(raw.replace(/\s/g, '').substring(4));
        return {
            success: true,
            data: Buffer.from(bytes),
            raw,
            timestamp: new Date(),
        };
    }
}
exports.SAEJ1850VPWProtocol = SAEJ1850VPWProtocol;
//# sourceMappingURL=sae_j1850_vpw.js.map