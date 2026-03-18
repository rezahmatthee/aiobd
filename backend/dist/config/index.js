"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aiobd',
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    obdAdapterPort: process.env.OBD_ADAPTER_PORT || '/dev/ttyUSB0',
};
//# sourceMappingURL=index.js.map