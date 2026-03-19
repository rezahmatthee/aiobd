'use strict';

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const compression = require('compression');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const { buildSecurityMiddleware, additionalSecurityHeaders } = require('./src/middleware/security');
const { globalLimiter } = require('./src/middleware/rateLimiter');
const authRouter = require('./src/routes/auth');
const { logger } = require('./src/utils/logger');

// ── Validate required environment variables ────────────────────────────────
const REQUIRED_ENV = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_SECRET',
  'HMAC_SECRET',
  'MONGODB_URI',
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Application setup ──────────────────────────────────────────────────────
const app = express();

// Assign a unique request ID early for tracing
app.use((req, _res, next) => {
  req.id = uuidv4();
  next();
});

// Compression
app.use(compression());

// HTTP request logging (use tiny format in production to avoid PII leakage)
app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.path === '/health',
  })
);

// Body parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware stack (Helmet, CORS, NoSQL sanitization, HPP)
buildSecurityMiddleware().forEach((mw) => app.use(mw));

// Additional cache-control and request-id headers
app.use(additionalSecurityHeaders);

// Global rate limiter
app.use(globalLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// Health check (unauthenticated, not logged)
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler (never leak stack traces in production)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logger.error({ message: err.message, stack: NODE_ENV !== 'production' ? err.stack : undefined });
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Database connection ────────────────────────────────────────────────────
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info({ message: 'MongoDB connected' });

    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info({ message: `Server running on port ${PORT}`, env: NODE_ENV });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info({ message: `${signal} received — shutting down gracefully` });
      server.close(async () => {
        await mongoose.disconnect();
        logger.info({ message: 'Server shut down' });
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (err) {
    logger.error({ message: 'Startup failed', error: err.message });
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
