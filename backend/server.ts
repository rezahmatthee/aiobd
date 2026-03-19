import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './src/config/index';
import { logger } from './src/utils/logger';

const app: Application = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
  pingTimeout: config.socketPingTimeout,
  pingInterval: config.socketPingInterval,
});

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach io to requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as Request & { io: SocketIOServer }).io = io;
  next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '1.0.0',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error & { status?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(err.status ?? 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join_session', (sessionId: string) => {
    void socket.join(sessionId);
    logger.debug(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('leave_session', (sessionId: string) => {
    void socket.leave(sessionId);
    logger.debug(`Socket ${socket.id} left session ${sessionId}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// MongoDB connection
async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err });
    process.exit(1);
  }
}

// Start server
async function start(): Promise<void> {
  await connectDB();

  httpServer.listen(config.port, config.host, () => {
    logger.info(`AIOBD server running on ${config.host}:${config.port} [${config.nodeEnv}]`);
  });
}

// Graceful shutdown
function shutdown(signal: string): void {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  httpServer.close(() => {
    mongoose.connection.close().then(() => {
      logger.info('MongoDB disconnected. Server stopped.');
      process.exit(0);
    }).catch(() => process.exit(1));
  });
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

void start();

export { app, io, httpServer };
