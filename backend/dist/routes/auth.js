"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', validation_1.validateAuthInput, auth_1.register);
router.post('/login', validation_1.validateAuthInput, auth_1.login);
router.post('/logout', auth_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map