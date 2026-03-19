'use strict';

process.env.ENCRYPTION_SECRET = 'a'.repeat(32);
process.env.ENCRYPTION_SALT = 'test-salt';
process.env.HMAC_SECRET = 'b'.repeat(64);
process.env.JWT_ACCESS_SECRET = 'c'.repeat(64);
process.env.JWT_REFRESH_SECRET = 'd'.repeat(64);
process.env.MONGODB_URI = 'mongodb://localhost:27017/aiobd_test';

const { validate } = require('../middleware/validate');

function mockReqRes(body) {
  const req = { body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('validate middleware', () => {
  describe('register schema', () => {
    const mw = validate('register');

    it('passes valid registration data', () => {
      const { req, res, next } = mockReqRes({
        name: 'Alice Tester',
        email: 'alice@example.com',
        password: 'Str0ng!Passw0rd#',
      });
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects weak password', () => {
      const { req, res, next } = mockReqRes({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'weakpass',
      });
      mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects missing email', () => {
      const { req, res, next } = mockReqRes({
        name: 'Bob',
        password: 'Str0ng!Passw0rd#',
      });
      mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('strips unknown fields', () => {
      const { req, res, next } = mockReqRes({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Str0ng!Passw0rd#',
        admin: true,
        __proto__: {},
      });
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.body.admin).toBeUndefined();
    });

    it('normalises email to lowercase', () => {
      const { req, res, next } = mockReqRes({
        name: 'Alice',
        email: 'ALICE@EXAMPLE.COM',
        password: 'Str0ng!Passw0rd#',
      });
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.body.email).toBe('alice@example.com');
    });
  });

  describe('login schema', () => {
    const mw = validate('login');

    it('passes valid login data', () => {
      const { req, res, next } = mockReqRes({
        email: 'alice@example.com',
        password: 'anyPassword123',
      });
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects missing password', () => {
      const { req, res, next } = mockReqRes({ email: 'alice@example.com' });
      mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('refreshToken schema', () => {
    const mw = validate('refreshToken');

    it('passes a valid 128-char hex refresh token', () => {
      const { req, res, next } = mockReqRes({ refreshToken: 'a'.repeat(128) });
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects tokens of wrong length', () => {
      const { req, res, next } = mockReqRes({ refreshToken: 'a'.repeat(64) });
      mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('changePassword schema', () => {
    const mw = validate('changePassword');

    it('accepts valid password change', () => {
      const { req, res, next } = mockReqRes({
        currentPassword: 'OldPass123!',
        newPassword: 'NewStr0ng!Pass#2',
      });
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects weak new password', () => {
      const { req, res, next } = mockReqRes({
        currentPassword: 'OldPass123!',
        newPassword: 'weak',
      });
      mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
