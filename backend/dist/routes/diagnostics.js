"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diagnostics_1 = require("../controllers/diagnostics");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.post('/connect', diagnostics_1.connectVehicle);
router.get('/live/:vehicleId', diagnostics_1.getLiveData);
router.get('/codes/:vehicleId', diagnostics_1.getDTCCodes);
router.post('/clear/:vehicleId', diagnostics_1.clearDTCCodes);
exports.default = router;
//# sourceMappingURL=diagnostics.js.map