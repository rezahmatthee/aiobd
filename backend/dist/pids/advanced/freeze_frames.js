"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREEZE_FRAME_PIDS = void 0;
exports.parseFreezeFrame = parseFreezeFrame;
const standard_1 = require("../standard");
function parseFreezeFrame(dtcCode, rawResponses) {
    const pidValues = [];
    for (const [pidHex, raw] of Object.entries(rawResponses)) {
        const pid = parseInt(pidHex);
        const pidDef = (0, standard_1.findPID)(0x02, pid);
        if (pidDef) {
            const parts = raw.trim().split(/\s+/);
            const dataBytes = parts.slice(2).map((b) => parseInt(b, 16));
            pidValues.push({
                pid: pidDef,
                rawValue: dataBytes,
                calculatedValue: pidDef.formula(dataBytes),
                unit: pidDef.unit,
                timestamp: new Date(),
            });
        }
    }
    return {
        dtcCode,
        pidValues,
        timestamp: new Date(),
    };
}
exports.FREEZE_FRAME_PIDS = [0x02, 0x04, 0x05, 0x06, 0x07, 0x0C, 0x0D, 0x0F, 0x10, 0x11];
//# sourceMappingURL=freeze_frames.js.map