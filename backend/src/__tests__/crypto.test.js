'use strict';

// Set required environment variables before any module loads
process.env.ENCRYPTION_SECRET = 'a'.repeat(32);
process.env.ENCRYPTION_SALT = 'test-salt';
process.env.HMAC_SECRET = 'b'.repeat(64);
process.env.JWT_ACCESS_SECRET = 'c'.repeat(64);
process.env.JWT_REFRESH_SECRET = 'd'.repeat(64);
process.env.MONGODB_URI = 'mongodb://localhost:27017/aiobd_test';

const { encrypt, decrypt, sign, verify, randomToken, sha256 } = require('../utils/crypto');

describe('crypto utilities', () => {
  describe('encrypt / decrypt', () => {
    it('should encrypt and decrypt a string round-trip', () => {
      const plaintext = 'user@example.com';
      const ciphertext = encrypt(plaintext);
      expect(ciphertext).not.toBe(plaintext);
      expect(decrypt(ciphertext)).toBe(plaintext);
    });

    it('should produce different ciphertexts for the same plaintext (random IV)', () => {
      const a = encrypt('test');
      const b = encrypt('test');
      expect(a).not.toBe(b);
    });

    it('should return null for null input', () => {
      expect(encrypt(null)).toBeNull();
      expect(decrypt(null)).toBeNull();
    });

    it('should throw on tampered ciphertext', () => {
      const ciphertext = encrypt('sensitive');
      const [iv, tag, data] = ciphertext.split(':');
      const tampered = `${iv}:${tag}:${'00'.repeat(data.length / 2)}`;
      expect(() => decrypt(tampered)).toThrow();
    });
  });

  describe('sign / verify', () => {
    it('should sign and verify data correctly', () => {
      const data = 'some-data-to-sign';
      const signature = sign(data);
      expect(verify(data, signature)).toBe(true);
    });

    it('should reject a tampered signature', () => {
      const data = 'some-data';
      const signature = sign(data);
      const tampered = signature.replace(/[0-9a-f]/, (c) => (parseInt(c, 16) ^ 1).toString(16));
      expect(verify(data, tampered)).toBe(false);
    });
  });

  describe('randomToken', () => {
    it('should generate a hex string of the expected length', () => {
      const token = randomToken(32);
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique tokens', () => {
      expect(randomToken()).not.toBe(randomToken());
    });
  });

  describe('sha256', () => {
    it('should be deterministic', () => {
      expect(sha256('hello')).toBe(sha256('hello'));
    });

    it('should produce a 64-char hex string', () => {
      expect(sha256('test')).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce different hashes for different inputs', () => {
      expect(sha256('a')).not.toBe(sha256('b'));
    });
  });
});
