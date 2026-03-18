"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolStatus = exports.ProtocolType = void 0;
var ProtocolType;
(function (ProtocolType) {
    ProtocolType["SAE_J1850_PWM"] = "SAE_J1850_PWM";
    ProtocolType["SAE_J1850_VPW"] = "SAE_J1850_VPW";
    ProtocolType["ISO_9141_2"] = "ISO_9141_2";
    ProtocolType["ISO_14230"] = "ISO_14230";
    ProtocolType["ISO_15765"] = "ISO_15765";
    ProtocolType["ISO_27145"] = "ISO_27145";
    ProtocolType["AUTO"] = "AUTO";
})(ProtocolType || (exports.ProtocolType = ProtocolType = {}));
var ProtocolStatus;
(function (ProtocolStatus) {
    ProtocolStatus["DISCONNECTED"] = "DISCONNECTED";
    ProtocolStatus["CONNECTING"] = "CONNECTING";
    ProtocolStatus["CONNECTED"] = "CONNECTED";
    ProtocolStatus["ERROR"] = "ERROR";
})(ProtocolStatus || (exports.ProtocolStatus = ProtocolStatus = {}));
//# sourceMappingURL=protocol.js.map