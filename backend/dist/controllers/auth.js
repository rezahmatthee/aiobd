"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
async function register(req, res) {
    try {
        const { email, password, name } = req.body;
        const existingUser = await user_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        const user = new user_1.User({ email, password, name });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
        res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    }
    catch (err) {
        logger_1.logger.error('Register error', err);
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await user_1.User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
        res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    }
    catch (err) {
        logger_1.logger.error('Login error', err);
        res.status(500).json({ error: 'Login failed' });
    }
}
async function logout(_req, res) {
    res.json({ message: 'Logged out successfully' });
}
//# sourceMappingURL=auth.js.map