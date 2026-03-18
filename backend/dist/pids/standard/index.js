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
exports.findPID = findPID;
__exportStar(require("./modes"), exports);
__exportStar(require("./engine"), exports);
__exportStar(require("./emissions"), exports);
__exportStar(require("./fuel"), exports);
const engine_1 = require("./engine");
const emissions_1 = require("./emissions");
const fuel_1 = require("./fuel");
exports.ALL_STANDARD_PIDS = [
    ...engine_1.ENGINE_PIDS,
    ...emissions_1.EMISSION_PIDS,
    ...fuel_1.FUEL_PIDS,
];
function findPID(mode, pid) {
    return exports.ALL_STANDARD_PIDS.find((p) => p.mode === mode && p.pid === pid);
}
//# sourceMappingURL=index.js.map