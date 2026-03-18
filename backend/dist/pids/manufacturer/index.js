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
exports.MANUFACTURER_PIDS = void 0;
exports.getManufacturerPIDs = getManufacturerPIDs;
__exportStar(require("./ford"), exports);
__exportStar(require("./gm"), exports);
__exportStar(require("./toyota"), exports);
__exportStar(require("./vw"), exports);
__exportStar(require("./bmw"), exports);
const ford_1 = require("./ford");
const gm_1 = require("./gm");
const toyota_1 = require("./toyota");
const vw_1 = require("./vw");
const bmw_1 = require("./bmw");
exports.MANUFACTURER_PIDS = {
    FORD: ford_1.FORD_PIDS,
    GM: gm_1.GM_PIDS,
    TOYOTA: toyota_1.TOYOTA_PIDS,
    VW: vw_1.VW_PIDS,
    BMW: bmw_1.BMW_PIDS,
};
function getManufacturerPIDs(manufacturer) {
    return exports.MANUFACTURER_PIDS[manufacturer.toUpperCase()] || [];
}
//# sourceMappingURL=index.js.map