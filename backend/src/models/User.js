'use strict';

const mongoose = require('mongoose');
const argon2 = require('argon2');
const speakeasy = require('speakeasy');
const securityConfig = require('../config/security');
const { encrypt, decrypt } = require('../utils/crypto');

const { argon2: argon2Opts, password: pwdConfig } = securityConfig;

// Encrypted field helpers
function encryptField(val) {
  return val ? encrypt(val) : val;
}
function decryptField(val) {
  return val ? decrypt(val) : val;
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },

    // Email stored encrypted; a lowercase SHA-256 index is kept for lookups
    _emailEncrypted: { type: String },
    emailHash: { type: String, unique: true, sparse: true },

    password: { type: String, required: true },
    passwordHistory: { type: [String], default: [] },
    passwordChangedAt: { type: Date, default: Date.now },
    requirePasswordChange: { type: Boolean, default: true },

    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },

    // Account lockout
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },

    // MFA
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, default: null },
    mfaBackupCodes: { type: [String], default: [] },

    // PII stored encrypted
    _phoneEncrypted: { type: String },
    _vinEncrypted: { type: String },

    // Active refresh token count for session limit enforcement
    activeSessions: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual: email (transparent encrypt/decrypt)
UserSchema.virtual('email')
  .get(function () {
    return decryptField(this._emailEncrypted);
  })
  .set(function (val) {
    if (!val) return;
    const { sha256 } = require('../utils/crypto');
    this._emailEncrypted = encryptField(val.toLowerCase());
    this.emailHash = sha256(val.toLowerCase());
  });

UserSchema.virtual('phone')
  .get(function () {
    return decryptField(this._phoneEncrypted);
  })
  .set(function (val) {
    this._phoneEncrypted = encryptField(val);
  });

UserSchema.virtual('vin')
  .get(function () {
    return decryptField(this._vinEncrypted);
  })
  .set(function (val) {
    this._vinEncrypted = encryptField(val);
  });

/**
 * Hash password with Argon2id before saving.
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Rotate password history before hashing the new password
  // (this.password still holds the old hash at this point)
  if (this._id) {
    this.passwordHistory.push(this.password);
    if (this.passwordHistory.length > pwdConfig.historyLimit) {
      this.passwordHistory = this.passwordHistory.slice(-pwdConfig.historyLimit);
    }
  }

  this.password = await argon2.hash(this.password, {
    type: argon2.argon2id,
    timeCost: argon2Opts.timeCost,
    memoryCost: argon2Opts.memoryCost,
    parallelism: argon2Opts.parallelism,
  });

  this.passwordChangedAt = new Date();
  next();
});

/**
 * Verifies a candidate password against the stored hash.
 */
UserSchema.methods.verifyPassword = async function (candidate) {
  return argon2.verify(this.password, candidate);
};

/**
 * Checks whether a candidate password has been used recently.
 */
UserSchema.methods.isPasswordInHistory = async function (candidate) {
  for (const oldHash of this.passwordHistory) {
    if (await argon2.verify(oldHash, candidate)) return true;
  }
  return false;
};

/**
 * @deprecated Password history rotation is now handled automatically in the
 * pre-save hook. This method is kept for backward compatibility but is a no-op.
 */
UserSchema.methods.rotatePasswordHistory = function () {
  // History rotation is performed inside the pre-save hook.
};

/**
 * Records a failed login attempt and applies lockout if threshold exceeded.
 */
UserSchema.methods.recordFailedLogin = function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= pwdConfig.lockout.maxAttempts) {
    this.lockoutUntil = new Date(
      Date.now() + pwdConfig.lockout.durationMinutes * 60 * 1000
    );
  }
};

/**
 * Resets failed login attempts and removes lockout.
 */
UserSchema.methods.resetFailedLogins = function () {
  this.failedLoginAttempts = 0;
  this.lockoutUntil = null;
};

/**
 * Returns true if the account is currently locked out.
 */
UserSchema.methods.isLockedOut = function () {
  return this.lockoutUntil && this.lockoutUntil > new Date();
};

/**
 * Returns true if the password has expired.
 */
UserSchema.methods.isPasswordExpired = function () {
  if (!this.passwordChangedAt) return false;
  const expiry = new Date(
    this.passwordChangedAt.getTime() + pwdConfig.expirationDays * 24 * 60 * 60 * 1000
  );
  return new Date() > expiry;
};

/**
 * Generates a new TOTP secret and returns the otpauth URL for QR generation.
 */
UserSchema.methods.generateMfaSecret = function () {
  const secret = speakeasy.generateSecret({
    name: `${securityConfig.totp.issuer} (${this.email})`,
    issuer: securityConfig.totp.issuer,
  });
  this.mfaSecret = secret.base32;
  return secret.otpauth_url;
};

/**
 * Validates a TOTP token.
 */
UserSchema.methods.verifyTotp = function (token) {
  return speakeasy.totp.verify({
    secret: this.mfaSecret,
    encoding: 'base32',
    token,
    window: securityConfig.totp.window,
  });
};

// Ensure virtual fields are included in JSON/object output (for internal use)
UserSchema.set('toJSON', {
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.passwordHistory;
    delete ret.mfaSecret;
    delete ret.mfaBackupCodes;
    delete ret._emailEncrypted;
    delete ret._phoneEncrypted;
    delete ret._vinEncrypted;
    delete ret.emailHash;
    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);
