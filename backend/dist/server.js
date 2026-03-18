"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./middleware/error");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});
exports.io = io;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', routes_1.default);
app.use(error_1.errorHandler);
io.on('connection', (socket) => {
    logger_1.logger.info(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => logger_1.logger.info(`Client disconnected: ${socket.id}`));
});
mongoose_1.default
    .connect(config_1.config.mongoUri)
    .then(() => {
    logger_1.logger.info('Connected to MongoDB');
    httpServer.listen(config_1.config.port, () => {
        logger_1.logger.info(`Server running on port ${config_1.config.port}`);
    });
})
    .catch((err) => {
    logger_1.logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map