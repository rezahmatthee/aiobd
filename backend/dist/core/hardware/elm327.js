"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELM327Adapter = void 0;
const protocol_1 = require("../../types/protocol");
const adapter_1 = require("./adapter");
const logger_1 = require("../../utils/logger");
class ELM327Adapter extends adapter_1.BaseAdapter {
    constructor() {
        super(...arguments);
        this.name = 'ELM327';
        this.port = '';
    }
    async connect(port, _config) {
        this.port = port;
        this.setStatus(adapter_1.AdapterStatus.CONNECTING);
        logger_1.logger.info(`Connecting ELM327 on port ${port}`);
        // Initialize ELM327
        await this.sendCommand('ATZ'); // Reset
        await this.sendCommand('ATE0'); // Echo off
        await this.sendCommand('ATL0'); // Linefeeds off
        await this.sendCommand('ATS0'); // Spaces off
        await this.sendCommand('ATH0'); // Headers off
        this.setStatus(adapter_1.AdapterStatus.CONNECTED);
        logger_1.logger.info('ELM327 initialized successfully');
    }
    async disconnect() {
        await this.sendCommand('ATZ');
        this.setStatus(adapter_1.AdapterStatus.DISCONNECTED);
    }
    async sendCommand(command) {
        // In production, this would write to the serial port and read response
        logger_1.logger.debug(`ELM327 command: ${command}`);
        return 'OK';
    }
    async getAdapterInfo() {
        const version = await this.sendCommand('ATI');
        return {
            name: 'ELM327',
            version: version || 'ELM327 v2.1',
            supportedProtocols: [
                protocol_1.ProtocolType.SAE_J1850_PWM,
                protocol_1.ProtocolType.SAE_J1850_VPW,
                protocol_1.ProtocolType.ISO_9141_2,
                protocol_1.ProtocolType.ISO_14230,
                protocol_1.ProtocolType.ISO_15765,
            ],
        };
    }
    async detectProtocol() {
        const response = await this.sendCommand('ATSP0'); // Auto-detect protocol
        logger_1.logger.info(`Protocol detection response: ${response}`);
        // Map ELM327 protocol numbers to our types
        return protocol_1.ProtocolType.ISO_15765; // Default to CAN (most modern vehicles)
    }
}
exports.ELM327Adapter = ELM327Adapter;
//# sourceMappingURL=elm327.js.map