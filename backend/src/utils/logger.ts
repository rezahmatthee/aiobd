import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index';

// Ensure log directory exists
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${String(ts)} [${level}]: ${String(stack ?? message)}${metaStr}`;
});

const transports: winston.transport[] = [
  new DailyRotateFile({
    filename: path.join(config.logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: config.logMaxSize,
    maxFiles: config.logMaxFiles,
    format: combine(timestamp(), errors({ stack: true }), json()),
  }),
  new DailyRotateFile({
    filename: path.join(config.logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: config.logMaxSize,
    maxFiles: config.logMaxFiles,
    format: combine(timestamp(), errors({ stack: true }), json()),
  }),
];

if (config.nodeEnv !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

export const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: { service: 'aiobd-backend' },
  transports,
});
