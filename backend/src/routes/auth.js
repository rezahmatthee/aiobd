'use strict';

const express = require('express');
const qrcode = require('qrcode');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const RefreshToken = require('../models/RefreshToken');
const { signAccessToken, issueRefreshToken, rotateRefreshToken, authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const { logSecurityEvent, logAudit } = require('../utils/logger');
const { sha256, randomToken } = require('../utils/crypto');
const argon2 = require('argon2');
const securityConfig = require('../config/security');

const router = express.Router();

function clientMeta(req) {
  return {
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
    deviceFingerprint: req.headers['x-device-fingerprint'] || '',
  };
}

async function writeAudit(userId, action, req, extra = {}) {
  try {
    await AuditLog.create({
      userId,
      action,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      ...extra,
    });
  } catch (_) {
    // Audit log failures must never break the request
  }
}

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', authLimiter, validate('register'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Duplicate check (via hash)
    if (await User.findOne({ emailHash: sha256(email) })) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({ name, password });
    user.email = email;
    await user.save();

    logAudit('USER_REGISTERED', user._id, req.ip);
    return res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    logSecurityEvent('REGISTER_ERROR', { ip: req.ip, error: err.message });
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', authLimiter, validate('login'), async (req, res) => {
  const { email, password, totpToken } = req.body;
  const meta = clientMeta(req);

  try {
    const user = await User.findOne({ emailHash: sha256(email) });

    if (!user) {
      logSecurityEvent('LOGIN_UNKNOWN_EMAIL', { ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      logSecurityEvent('LOGIN_INACTIVE_ACCOUNT', { userId: user._id, ip: req.ip });
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Account lockout check
    if (user.isLockedOut()) {
      logSecurityEvent('LOGIN_LOCKED_ACCOUNT', { userId: user._id, ip: req.ip });
      return res.status(423).json({ error: 'Account temporarily locked due to failed attempts' });
    }

    const passwordValid = await user.verifyPassword(password);
    if (!passwordValid) {
      user.recordFailedLogin();
      await user.save();
      logSecurityEvent('LOGIN_FAILED', { userId: user._id, ip: req.ip });
      await writeAudit(user._id, 'LOGIN_FAILED', req, { success: false });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // MFA check
    if (user.mfaEnabled) {
      if (!totpToken) {
        return res.status(200).json({ mfaRequired: true, message: 'MFA token required' });
      }
      if (!user.verifyTotp(totpToken)) {
        user.recordFailedLogin();
        await user.save();
        logSecurityEvent('MFA_FAILED', { userId: user._id, ip: req.ip });
        return res.status(401).json({ error: 'Invalid MFA token' });
      }
    }

    // Concurrent session limit
    const activeSessions = await RefreshToken.countDocuments({
      userId: user._id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
    if (activeSessions >= securityConfig.session.maxConcurrent) {
      // Revoke the oldest token to make room
      const oldest = await RefreshToken.findOne({
        userId: user._id,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: 1 });
      if (oldest) await oldest.revoke();
    }

    // Successful login
    user.resetFailedLogins();
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user, meta);

    logSecurityEvent('LOGIN_SUCCESS', { userId: user._id, ip: req.ip });
    logAudit('LOGIN', user._id, req.ip);

    const requirePasswordChange = user.requirePasswordChange || user.isPasswordExpired();

    return res.status(200).json({
      accessToken,
      refreshToken,
      requirePasswordChange,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    logSecurityEvent('LOGIN_ERROR', { ip: req.ip, error: err.message });
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ── POST /api/auth/refresh ─────────────────────────────────────────────────
router.post('/refresh', refreshLimiter, validate('refreshToken'), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const meta = clientMeta(req);

    const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(refreshToken, meta);
    return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    logSecurityEvent('REFRESH_FAILED', { ip: req.ip, error: err.message });
    return res.status(401).json({ error: err.message || 'Token refresh failed' });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const hash = sha256(refreshToken);
      await RefreshToken.findOneAndUpdate(
        { tokenHash: hash, userId: req.user._id },
        { isRevoked: true, revokedAt: new Date() }
      );
    }

    logAudit('LOGOUT', req.user._id, req.ip);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// ── POST /api/auth/logout-all ──────────────────────────────────────────────
router.post('/logout-all', authenticate, async (req, res) => {
  try {
    await RefreshToken.updateMany(
      { userId: req.user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
    logSecurityEvent('LOGOUT_ALL_SESSIONS', { userId: req.user._id, ip: req.ip });
    return res.status(200).json({ message: 'All sessions terminated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to terminate sessions' });
  }
});

// ── POST /api/auth/change-password ────────────────────────────────────────
router.post('/change-password', authenticate, validate('changePassword'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const valid = await user.verifyPassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (await user.isPasswordInHistory(newPassword)) {
      return res.status(400).json({ error: 'New password was used recently, choose a different one' });
    }

    // Pre-save hook handles password hashing and history rotation automatically
    user.password = newPassword;
    user.requirePasswordChange = false;
    await user.save();

    // Invalidate all refresh tokens on password change
    await RefreshToken.updateMany(
      { userId: user._id },
      { isRevoked: true, revokedAt: new Date() }
    );

    logSecurityEvent('PASSWORD_CHANGED', { userId: user._id, ip: req.ip });
    logAudit('PASSWORD_CHANGE', user._id, req.ip);
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Password change failed' });
  }
});

// ── POST /api/auth/mfa/setup ───────────────────────────────────────────────
router.post('/mfa/setup', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otpauthUrl = user.generateMfaSecret();
    await user.save();

    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
    return res.status(200).json({ qrCode: qrDataUrl, secret: user.mfaSecret });
  } catch (err) {
    return res.status(500).json({ error: 'MFA setup failed' });
  }
});

// ── POST /api/auth/mfa/verify ──────────────────────────────────────────────
router.post('/mfa/verify', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'TOTP token is required' });

    const user = await User.findById(req.user._id);
    if (!user.verifyTotp(token)) {
      return res.status(401).json({ error: 'Invalid TOTP token' });
    }

    user.mfaEnabled = true;
    await user.save();

    logSecurityEvent('MFA_ENABLED', { userId: user._id, ip: req.ip });
    return res.status(200).json({ message: 'MFA enabled successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'MFA verification failed' });
  }
});

// ── POST /api/auth/mfa/disable ─────────────────────────────────────────────
router.post('/mfa/disable', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const user = await User.findById(req.user._id);
    const valid = await user.verifyPassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    user.mfaEnabled = false;
    user.mfaSecret = null;
    user.mfaBackupCodes = [];
    await user.save();

    logSecurityEvent('MFA_DISABLED', { userId: user._id, ip: req.ip });
    return res.status(200).json({ message: 'MFA disabled successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to disable MFA' });
  }
});

module.exports = router;
