"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VEHICLE_INFO_ITEMS = void 0;
exports.VEHICLE_INFO_ITEMS = [
    {
        infoType: 0x02,
        name: 'VIN',
        description: 'Vehicle Identification Number',
        parser: (raw) => {
            const parts = raw.trim().split(/\s+/);
            return parts.slice(3).map((b) => String.fromCharCode(parseInt(b, 16))).join('');
        },
    },
    {
        infoType: 0x04,
        name: 'CALIBRATION_ID',
        description: 'Calibration ID',
        parser: (raw) => {
            const parts = raw.trim().split(/\s+/);
            return parts.slice(3).map((b) => String.fromCharCode(parseInt(b, 16))).join('');
        },
    },
    {
        infoType: 0x06,
        name: 'CVN',
        description: 'Calibration Verification Number',
        parser: (raw) => {
            const parts = raw.trim().split(/\s+/);
            return parts.slice(3).join(' ');
        },
    },
    {
        infoType: 0x0A,
        name: 'ECU_NAME',
        description: 'ECU name (ASCII)',
        parser: (raw) => {
            const parts = raw.trim().split(/\s+/);
            return parts.slice(3).map((b) => String.fromCharCode(parseInt(b, 16))).join('');
        },
    },
];
//# sourceMappingURL=mode_09.js.map