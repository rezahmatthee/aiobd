"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVehicleInput = validateVehicleInput;
exports.validateAuthInput = validateAuthInput;
const validators_1 = require("../utils/validators");
function validateVehicleInput(req, res, next) {
    const { make, model, year, vin } = req.body;
    if (!make || !model || !year) {
        res.status(400).json({ error: 'make, model, and year are required' });
        return;
    }
    if (year < 1980 || year > new Date().getFullYear() + 1) {
        res.status(400).json({ error: 'Invalid year' });
        return;
    }
    if (vin && !(0, validators_1.isValidVIN)(vin)) {
        res.status(400).json({ error: 'Invalid VIN format' });
        return;
    }
    next();
}
function validateAuthInput(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }
    next();
}
//# sourceMappingURL=validation.js.map