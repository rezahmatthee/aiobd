"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODE_06_TESTS = void 0;
exports.parseMode06Response = parseMode06Response;
exports.MODE_06_TESTS = {
    0x01: 'Rich to lean sensor threshold voltage (Bank 1, sensor 1)',
    0x02: 'Lean to rich sensor threshold voltage (Bank 1, sensor 1)',
    0x03: 'Low sensor voltage for switch time calculation (Bank 1, sensor 1)',
    0x04: 'High sensor voltage for switch time calculation (Bank 1, sensor 1)',
    0x05: 'Rich to lean sensor switch time (Bank 1, sensor 1)',
    0x06: 'Lean to rich sensor switch time (Bank 1, sensor 1)',
    0x07: 'Minimum sensor voltage for test cycle (Bank 1, sensor 1)',
    0x08: 'Maximum sensor voltage for test cycle (Bank 1, sensor 1)',
    0x09: 'Time between sensor transitions (Bank 1, sensor 1)',
    0x0A: 'Sensor period (Bank 1, sensor 1)',
    0x21: 'Catalyst temperature (Bank 1, sensor 1)',
    0x22: 'Catalyst temperature (Bank 2, sensor 1)',
    0x23: 'Catalyst temperature (Bank 1, sensor 2)',
    0x24: 'Catalyst temperature (Bank 2, sensor 2)',
    0x31: 'EGR monitor (commanded EGR and EGR error)',
    0x32: 'EGR monitor (commanded EGR and EGR error)',
    0x41: 'Evap system pressure',
    0x42: 'Evap system pressure',
};
function parseMode06Response(raw) {
    const parts = raw.trim().split(/\s+/);
    const results = [];
    for (let i = 2; i + 7 < parts.length; i += 9) {
        results.push({
            testId: parseInt(parts[i], 16),
            componentId: parseInt(parts[i + 1], 16),
            testValue: (parseInt(parts[i + 2], 16) * 256) + parseInt(parts[i + 3], 16),
            minValue: (parseInt(parts[i + 4], 16) * 256) + parseInt(parts[i + 5], 16),
            maxValue: (parseInt(parts[i + 6], 16) * 256) + parseInt(parts[i + 7], 16),
            passed: false,
        });
    }
    results.forEach((r) => {
        r.passed = r.testValue >= r.minValue && r.testValue <= r.maxValue;
    });
    return results;
}
//# sourceMappingURL=mode_06.js.map