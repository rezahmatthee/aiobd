'use strict';

/**
 * Security configuration constants for the AIOBD platform.
 * All values can be overridden via environment variables.
 */

const config = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
    issuer: 'aiobd',
    audience: 'aiobd-api',
  },

  password: {
    minLength: 12,
    maxLength: 128,
    // Regex: at least one uppercase, one lowercase, one digit, one special char
    strengthRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,128}$/,
    historyLimit: 5,
    expirationDays: 90,
    lockout: {
      maxAttempts: 5,
      durationMinutes: 30,
    },
  },

  argon2: {
    timeCost: 3,
    memoryCost: 65536,
    parallelism: 4,
    type: 2, // argon2id
  },

  session: {
    adminTimeoutMinutes: 30,
    userTimeoutMinutes: 60,
    maxConcurrent: 3,
  },

  rateLimit: {
    global: {
      windowMs: 60 * 1000,
      max: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5,
    },
    api: {
      windowMs: 60 * 1000,
      max: 60,
    },
    tokenRefresh: {
      windowMs: 60 * 60 * 1000,
      max: 5,
    },
    fileUpload: {
      windowMs: 60 * 60 * 1000,
      max: 10,
    },
  },

  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  },

  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    secret: process.env.ENCRYPTION_SECRET,
  },

  bodyLimit: {
    json: '10mb',
    urlencoded: '10mb',
  },

  totp: {
    issuer: 'AIOBD',
    window: 1,
  },

  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true',
  },

  piiFacets: ['email', 'phone', 'vin', 'licensePlate', 'address'],
};

module.exports = config;
