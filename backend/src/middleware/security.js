'use strict';

const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const securityConfig = require('../config/security');
const { logger } = require('../utils/logger');

/**
 * Builds and returns an array of security middleware to be applied globally.
 */
function buildSecurityMiddleware() {
  const middlewares = [];

  // ── Helmet: comprehensive HTTP security headers ─────────────────────────
  middlewares.push(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: false,
    })
  );

  // ── CORS: whitelist-based origin control ────────────────────────────────
  const { allowedOrigins, credentials } = securityConfig.cors;
  middlewares.push(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server / health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        logger.warn({ message: 'CORS_REJECTED', origin });
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      },
      credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID'],
      maxAge: 86400,
    })
  );

  // ── NoSQL injection prevention ──────────────────────────────────────────
  middlewares.push(mongoSanitize({ replaceWith: '_', allowDots: false }));

  // ── HTTP Parameter Pollution prevention ────────────────────────────────
  middlewares.push(hpp());

  return middlewares;
}

/**
 * Adds security-related response headers that are not covered by Helmet.
 */
function additionalSecurityHeaders(req, res, next) {
  res.setHeader('X-Request-ID', req.id || require('uuid').v4());
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

module.exports = { buildSecurityMiddleware, additionalSecurityHeaders };
