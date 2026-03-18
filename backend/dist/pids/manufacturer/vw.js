"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VW_MANUFACTURER_ID = exports.VW_PIDS = void 0;
exports.VW_PIDS = [
    {
        mode: 0x22,
        pid: 0x2000,
        name: 'VW_BOOST_PRESSURE',
        description: 'VW/Audi: Turbocharger boost pressure',
        minValue: 0,
        maxValue: 500,
        unit: 'mbar',
        bytes: 2,
        formula: (bytes) => (bytes[0] * 256) + bytes[1],
    },
    {
        mode: 0x22,
        pid: 0x2001,
        name: 'VW_LAMBDA',
        description: 'VW/Audi: Lambda value',
        minValue: 0,
        maxValue: 4,
        unit: 'λ',
        bytes: 2,
        formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 32768,
    },
];
exports.VW_MANUFACTURER_ID = 'VW';
//# sourceMappingURL=vw.js.map