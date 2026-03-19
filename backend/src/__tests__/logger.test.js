'use strict';

process.env.ENCRYPTION_SECRET = 'a'.repeat(32);
process.env.ENCRYPTION_SALT = 'test-salt';
process.env.HMAC_SECRET = 'b'.repeat(64);
process.env.JWT_ACCESS_SECRET = 'c'.repeat(64);
process.env.JWT_REFRESH_SECRET = 'd'.repeat(64);
process.env.MONGODB_URI = 'mongodb://localhost:27017/aiobd_test';

const { logger, logSecurityEvent, logAudit } = require('../utils/logger');

// Spy on the underlying logger transports
jest.spyOn(logger, 'warn').mockImplementation(() => {});
jest.spyOn(logger, 'info').mockImplementation(() => {});

describe('logger utilities', () => {
  afterEach(() => jest.clearAllMocks());

  describe('logSecurityEvent', () => {
    it('calls logger.warn with the event name', () => {
      logSecurityEvent('LOGIN_FAILED', { ip: '1.2.3.4', userId: 'abc123' });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'SECURITY_EVENT: LOGIN_FAILED' })
      );
    });

    it('masks password in metadata', () => {
      logSecurityEvent('TEST_EVENT', { password: 'secret123', ip: '1.2.3.4' });
      const call = logger.warn.mock.calls[0][0];
      expect(call.password).toBe('***');
      expect(call.ip).toBe('1.2.3.4');
    });

    it('masks email in metadata', () => {
      logSecurityEvent('TEST_EVENT', { email: 'user@example.com' });
      const call = logger.warn.mock.calls[0][0];
      expect(call.email).not.toBe('user@example.com');
      expect(call.email).toContain('*');
    });
  });

  describe('logAudit', () => {
    it('calls logger.info with AUDIT prefix', () => {
      logAudit('PASSWORD_CHANGE', 'user123', '10.0.0.1');
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'AUDIT: PASSWORD_CHANGE' })
      );
    });

    it('includes userId and ip', () => {
      logAudit('LOGIN', 'uid-456', '192.168.1.1', null, null);
      const call = logger.info.mock.calls[0][0];
      expect(call.userId).toBe('uid-456');
      expect(call.ip).toBe('192.168.1.1');
    });
  });
});
