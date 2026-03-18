"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORD_MANUFACTURER_ID = exports.FORD_PIDS = void 0;
exports.FORD_PIDS = [
    {
        mode: 0x22,
        pid: 0x1002,
        name: 'FORD_BOOST_PRESSURE',
        description: 'Ford: Turbocharger boost pressure',
        minValue: 0,
        maxValue: 300,
        unit: 'kPa',
        bytes: 2,
        formula: (bytes) => ((bytes[0] * 256) + bytes[1]) * 0.1,
    },
    {
        mode: 0x22,
        pid: 0x10A3,
        name: 'FORD_INJECTOR_DUTY_CYCLE',
        description: 'Ford: Fuel injector duty cycle',
        minValue: 0,
        maxValue: 100,
        unit: '%',
        bytes: 2,
        formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 100,
    },
    {
        mode: 0x22,
        pid: 0x1234,
        name: 'FORD_TRANSMISSION_TEMP',
        description: 'Ford: Transmission fluid temperature',
        minValue: -40,
        maxValue: 215,
        unit: '°C',
        bytes: 1,
        formula: (bytes) => bytes[0] - 40,
    },
];
exports.FORD_MANUFACTURER_ID = 'FORD';
//# sourceMappingURL=ford.js.map