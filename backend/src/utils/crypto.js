'use strict';

const crypto = require('crypto');
const securityConfig = require('../config/security');

const { algorithm, keyLength, ivLength, tagLength } = securityConfig.encryption;

/**
 * Derives a 32-byte AES key from the configured secret using PBKDF2.
 */
function deriveKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be set and at least 32 characters long');
  }
  const salt = process.env.ENCRYPTION_SALT;
  if (!salt) {
    throw new Error('ENCRYPTION_SALT must be set');
  }
  return crypto.pbkdf2Sync(secret, salt, 100000, keyLength, 'sha512');
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a colon-delimited string: iv:authTag:ciphertext (all hex-encoded).
 */
function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  const key = deriveKey();
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength: tagLength });
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string produced by encrypt().
 */
function decrypt(ciphertext) {
  if (!ciphertext) return null;
  const parts = ciphertext.split(':');
  if (parts.length !== 3) throw new Error('Invalid ciphertext format');
  const [ivHex, tagHex, dataHex] = parts;
  const key = deriveKey();
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'), {
    authTagLength: tagLength,
  });
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Creates a cryptographically secure HMAC-SHA256 signature.
 */
function sign(data) {
  const secret = process.env.HMAC_SECRET;
  if (!secret) throw new Error('HMAC_SECRET must be set');
  return crypto.createHmac('sha256', secret).update(String(data)).digest('hex');
}

/**
 * Verifies a HMAC-SHA256 signature using constant-time comparison.
 */
function verify(data, signature) {
  const expected = sign(data);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

/**
 * Generates a cryptographically random token of `bytes` bytes (hex-encoded).
 */
function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hashes a value with SHA-256 (for token storage/lookup).
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

module.exports = { encrypt, decrypt, sign, verify, randomToken, sha256 };
