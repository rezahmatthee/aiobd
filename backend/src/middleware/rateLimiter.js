'use strict';

const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security');
const { logger } = require('../utils/logger');

function onLimitReached(req, res, options) {
  logger.warn({
    message: 'RATE_LIMIT_EXCEEDED',
    ip: req.ip,
    path: req.path,
    method: req.method,
  });
}

/**
 * Global rate limiter: 100 requests / minute per IP.
 */
const globalLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.global.windowMs,
  max: securityConfig.rateLimit.global.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

/**
 * Auth endpoint limiter: 5 attempts / 15 min per IP.
 */
const authLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.auth.windowMs,
  max: securityConfig.rateLimit.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again in 15 minutes.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
  skipSuccessfulRequests: false,
});

/**
 * Token refresh limiter: 5 refreshes / hour per IP.
 */
const refreshLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.tokenRefresh.windowMs,
  max: securityConfig.rateLimit.tokenRefresh.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Token refresh limit exceeded, please try again later.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

/**
 * API endpoint limiter: 60 requests / minute per authenticated user (falls back to IP).
 */
const apiLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.api.windowMs,
  max: securityConfig.rateLimit.api.max,
  keyGenerator: (req) => (req.user ? req.user.id : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'API rate limit exceeded, please slow down.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

/**
 * File upload limiter: 10 uploads / hour per user.
 */
const uploadLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.fileUpload.windowMs,
  max: securityConfig.rateLimit.fileUpload.max,
  keyGenerator: (req) => (req.user ? req.user.id : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'File upload limit exceeded, please try again later.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

module.exports = { globalLimiter, authLimiter, refreshLimiter, apiLimiter, uploadLimiter };
