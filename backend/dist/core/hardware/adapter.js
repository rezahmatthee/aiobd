"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAdapter = exports.AdapterStatus = void 0;
const logger_1 = require("../../utils/logger");
var AdapterStatus;
(function (AdapterStatus) {
    AdapterStatus["DISCONNECTED"] = "DISCONNECTED";
    AdapterStatus["CONNECTING"] = "CONNECTING";
    AdapterStatus["CONNECTED"] = "CONNECTED";
    AdapterStatus["ERROR"] = "ERROR";
})(AdapterStatus || (exports.AdapterStatus = AdapterStatus = {}));
class BaseAdapter {
    constructor() {
        this.status = AdapterStatus.DISCONNECTED;
    }
    isConnected() {
        return this.status === AdapterStatus.CONNECTED;
    }
    setStatus(status) {
        this.status = status;
        logger_1.logger.debug(`Adapter ${this.name} status changed to ${status}`);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.BaseAdapter = BaseAdapter;
//# sourceMappingURL=adapter.js.map