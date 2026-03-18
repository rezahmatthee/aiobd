"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicles_1 = require("../controllers/vehicles");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', vehicles_1.getVehicles);
router.post('/', validation_1.validateVehicleInput, vehicles_1.createVehicle);
router.get('/:id', vehicles_1.getVehicle);
router.delete('/:id', vehicles_1.deleteVehicle);
exports.default = router;
//# sourceMappingURL=vehicles.js.map