"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidVIN = isValidVIN;
exports.isValidPID = isValidPID;
exports.isValidMode = isValidMode;
exports.isValidDTC = isValidDTC;
exports.sanitizeHexString = sanitizeHexString;
function isValidVIN(vin) {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
}
function isValidPID(pid) {
    return pid >= 0x00 && pid <= 0xFF;
}
function isValidMode(mode) {
    return mode >= 0x01 && mode <= 0x0A;
}
function isValidDTC(code) {
    const dtcRegex = /^[PCBU][0-9]{4}$/i;
    return dtcRegex.test(code);
}
function sanitizeHexString(hex) {
    return hex.replace(/[^0-9A-Fa-f\s]/g, '').trim();
}
//# sourceMappingURL=validators.js.map