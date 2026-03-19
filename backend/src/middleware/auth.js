'use strict';

const jwt = require('jsonwebtoken');
const securityConfig = require('../config/security');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const { sha256, randomToken } = require('../utils/crypto');
const { logSecurityEvent } = require('../utils/logger');

const { jwt: jwtConfig } = securityConfig;

/**
 * Signs a short-lived access token (15 min).
 */
function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, type: 'access' },
    jwtConfig.accessSecret,
    {
      expiresIn: jwtConfig.accessExpiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }
  );
}

/**
 * Issues a refresh token and persists a hashed copy to the database.
 */
async function issueRefreshToken(user, meta = {}) {
  const raw = randomToken(64);
  const hash = sha256(raw);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    tokenHash: hash,
    userId: user._id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    deviceFingerprint: meta.deviceFingerprint,
    expiresAt,
  });

  return raw;
}

/**
 * Middleware: verify the Authorization Bearer access token.
 * Attaches `req.user` on success.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, jwtConfig.accessSecret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await User.findById(payload.sub).select('-password -passwordHistory -mfaSecret');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    logSecurityEvent('AUTH_FAILURE', { ip: req.ip, error: err.message });
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired' });
    }
    return res.status(401).json({ error: 'Invalid access token' });
  }
}

/**
 * Middleware factory: require one of the specified roles.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      logSecurityEvent('AUTHZ_FAILURE', {
        userId: req.user._id,
        role: req.user.role,
        required: roles,
        ip: req.ip,
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

/**
 * Rotates a refresh token: revokes the old one and issues a new pair.
 * Returns { accessToken, refreshToken } or throws on invalid input.
 */
async function rotateRefreshToken(rawToken, meta = {}) {
  const hash = sha256(rawToken);
  const stored = await RefreshToken.findOne({ tokenHash: hash });

  if (!stored) throw new Error('Refresh token not found');
  if (stored.isRevoked) {
    // Possible token reuse — revoke all active tokens for this user (security measure)
    await RefreshToken.updateMany(
      { userId: stored.userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
    logSecurityEvent('REFRESH_TOKEN_REUSE', { userId: stored.userId, ip: meta.ip });
    throw new Error('Refresh token already revoked — possible token reuse detected');
  }
  if (stored.expiresAt < new Date()) {
    throw new Error('Refresh token expired');
  }

  // Revoke old token
  await stored.revoke();

  // Issue new pair
  const user = await User.findById(stored.userId);
  if (!user || !user.isActive) throw new Error('User not found or inactive');

  const accessToken = signAccessToken(user);
  const newRefreshToken = await issueRefreshToken(user, meta);

  return { accessToken, refreshToken: newRefreshToken, user };
}

module.exports = {
  signAccessToken,
  issueRefreshToken,
  authenticate,
  requireRole,
  rotateRefreshToken,
};
