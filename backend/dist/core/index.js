"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProtocol = createProtocol;
__exportStar(require("./protocols/base"), exports);
__exportStar(require("./protocols/sae_j1850_pwm"), exports);
__exportStar(require("./protocols/sae_j1850_vpw"), exports);
__exportStar(require("./protocols/iso_9141_2"), exports);
__exportStar(require("./protocols/iso_14230"), exports);
__exportStar(require("./protocols/iso_15765"), exports);
__exportStar(require("./protocols/iso_27145"), exports);
__exportStar(require("./hardware/adapter"), exports);
__exportStar(require("./hardware/elm327"), exports);
const protocol_1 = require("../types/protocol");
const sae_j1850_pwm_1 = require("./protocols/sae_j1850_pwm");
const sae_j1850_vpw_1 = require("./protocols/sae_j1850_vpw");
const iso_9141_2_1 = require("./protocols/iso_9141_2");
const iso_14230_1 = require("./protocols/iso_14230");
const iso_15765_1 = require("./protocols/iso_15765");
const iso_27145_1 = require("./protocols/iso_27145");
function createProtocol(type) {
    switch (type) {
        case protocol_1.ProtocolType.SAE_J1850_PWM:
            return new sae_j1850_pwm_1.SAEJ1850PWMProtocol();
        case protocol_1.ProtocolType.SAE_J1850_VPW:
            return new sae_j1850_vpw_1.SAEJ1850VPWProtocol();
        case protocol_1.ProtocolType.ISO_9141_2:
            return new iso_9141_2_1.ISO91412Protocol();
        case protocol_1.ProtocolType.ISO_14230:
            return new iso_14230_1.ISO14230Protocol();
        case protocol_1.ProtocolType.ISO_15765:
            return new iso_15765_1.ISO15765Protocol();
        case protocol_1.ProtocolType.ISO_27145:
            return new iso_27145_1.ISO27145Protocol();
        default:
            return new iso_15765_1.ISO15765Protocol();
    }
}
//# sourceMappingURL=index.js.map