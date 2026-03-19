'use strict';

const winston = require('winston');
require('winston-daily-rotate-file');
const { piiFacets } = require('../config/security');

/**
 * Recursively masks PII fields in log metadata objects.
 */
function maskPII(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(maskPII);

  const masked = {};
  for (const [key, value] of Object.entries(obj)) {
    if (piiFacets.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      if (typeof value === 'string' && value.length >= 3) {
        masked[key] = `${value[0]}${'*'.repeat(value.length - 2)}${value[value.length - 1]}`;
      } else {
        masked[key] = '***';
      }
    } else if (key === 'password' || key === 'token' || key === 'secret' || key === 'authorization') {
      masked[key] = '***';
    } else if (typeof value === 'object') {
      masked[key] = maskPII(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

const piiMaskFormat = winston.format((info) => {
  if (info.meta) info.meta = maskPII(info.meta);
  if (info.req) {
    const { body, query, params, headers } = info.req;
    info.req = {
      body: maskPII(body),
      query: maskPII(query),
      params: maskPII(params),
      headers: maskPII(headers),
    };
  }
  return info;
});

const transportOptions = (filename, level) => ({
  filename: `logs/${filename}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d',
  level,
  format: winston.format.combine(
    piiMaskFormat(),
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'aiobd-backend' },
  transports: [
    new winston.transports.DailyRotateFile(transportOptions('access', 'http')),
    new winston.transports.DailyRotateFile(transportOptions('error', 'error')),
    new winston.transports.DailyRotateFile(transportOptions('security', 'warn')),
    new winston.transports.DailyRotateFile(transportOptions('audit', 'info')),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        piiMaskFormat(),
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/**
 * Log a security event (login, permission change, key rotation, etc.)
 */
function logSecurityEvent(event, meta = {}) {
  logger.warn({ message: `SECURITY_EVENT: ${event}`, ...maskPII(meta) });
}

/**
 * Log an audit event (user action with before/after state).
 */
function logAudit(action, userId, ip, before = null, after = null) {
  logger.info({
    message: `AUDIT: ${action}`,
    userId,
    ip,
    before: maskPII(before),
    after: maskPII(after),
    timestamp: new Date().toISOString(),
  });
}

module.exports = { logger, logSecurityEvent, logAudit };
