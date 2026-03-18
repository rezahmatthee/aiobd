"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterService = exports.AdapterService = void 0;
const elm327_1 = require("../core/hardware/elm327");
const logger_1 = require("../utils/logger");
class AdapterService {
    constructor() {
        this.adapters = new Map();
    }
    async connectAdapter(vehicleId, port) {
        const adapter = new elm327_1.ELM327Adapter();
        await adapter.connect(port);
        this.adapters.set(vehicleId, adapter);
        logger_1.logger.info(`Adapter connected for vehicle ${vehicleId} on port ${port}`);
    }
    async disconnectAdapter(vehicleId) {
        const adapter = this.adapters.get(vehicleId);
        if (adapter) {
            await adapter.disconnect();
            this.adapters.delete(vehicleId);
        }
    }
    async detectProtocol(vehicleId) {
        const adapter = this.adapters.get(vehicleId);
        if (!adapter)
            throw new Error('No adapter connected');
        return adapter.detectProtocol();
    }
    getAdapter(vehicleId) {
        return this.adapters.get(vehicleId);
    }
    isConnected(vehicleId) {
        const adapter = this.adapters.get(vehicleId);
        return adapter?.isConnected() ?? false;
    }
}
exports.AdapterService = AdapterService;
exports.adapterService = new AdapterService();
//# sourceMappingURL=adapter.js.map