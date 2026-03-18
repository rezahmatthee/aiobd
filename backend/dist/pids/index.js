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
exports.ALL_STANDARD_PIDS = void 0;
exports.findPIDByName = findPIDByName;
exports.findManufacturerPID = findManufacturerPID;
__exportStar(require("./standard"), exports);
__exportStar(require("./advanced/mode_06"), exports);
__exportStar(require("./advanced/mode_09"), exports);
__exportStar(require("./advanced/freeze_frames"), exports);
__exportStar(require("./manufacturer"), exports);
const standard_1 = require("./standard");
Object.defineProperty(exports, "ALL_STANDARD_PIDS", { enumerable: true, get: function () { return standard_1.ALL_STANDARD_PIDS; } });
const manufacturer_1 = require("./manufacturer");
function findPIDByName(name) {
    return standard_1.ALL_STANDARD_PIDS.find((p) => p.name === name);
}
function findManufacturerPID(manufacturer, mode, pid) {
    const pids = (0, manufacturer_1.getManufacturerPIDs)(manufacturer);
    return pids.find((p) => p.mode === mode && p.pid === pid);
}
//# sourceMappingURL=index.js.map