"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIDMode = void 0;
var PIDMode;
(function (PIDMode) {
    PIDMode[PIDMode["CURRENT_DATA"] = 1] = "CURRENT_DATA";
    PIDMode[PIDMode["FREEZE_FRAME"] = 2] = "FREEZE_FRAME";
    PIDMode[PIDMode["FAULT_CODES"] = 3] = "FAULT_CODES";
    PIDMode[PIDMode["CLEAR_FAULT_CODES"] = 4] = "CLEAR_FAULT_CODES";
    PIDMode[PIDMode["TEST_RESULTS_NON_CAN"] = 5] = "TEST_RESULTS_NON_CAN";
    PIDMode[PIDMode["TEST_RESULTS_CAN"] = 6] = "TEST_RESULTS_CAN";
    PIDMode[PIDMode["PENDING_FAULT_CODES"] = 7] = "PENDING_FAULT_CODES";
    PIDMode[PIDMode["CONTROL_OPERATION"] = 8] = "CONTROL_OPERATION";
    PIDMode[PIDMode["VEHICLE_INFO"] = 9] = "VEHICLE_INFO";
    PIDMode[PIDMode["PERMANENT_FAULT_CODES"] = 10] = "PERMANENT_FAULT_CODES";
})(PIDMode || (exports.PIDMode = PIDMode = {}));
//# sourceMappingURL=pid.js.map