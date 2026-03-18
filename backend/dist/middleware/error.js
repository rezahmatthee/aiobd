"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.createError = createError;
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';
    logger_1.logger.error('Error handled:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}
//# sourceMappingURL=error.js.map