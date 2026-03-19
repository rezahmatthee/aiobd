'use strict';

const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
    deviceFingerprint: { type: String },
    isRevoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: auto-delete expired tokens after 7 days
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Revoke this token and record revocation timestamp.
 */
RefreshTokenSchema.methods.revoke = async function () {
  this.isRevoked = true;
  this.revokedAt = new Date();
  await this.save();
};

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
