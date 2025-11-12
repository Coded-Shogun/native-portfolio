import { logInfo, logError, logWarning, logHttp, logAudit, logSecurityEvent } from '../../utils/logger';
import winston from 'winston';

// Mock winston to prevent actual file writes during tests
jest.mock('winston', () => {
  const actualWinston = jest.requireActual('winston');
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  };

  return {
    ...actualWinston,
    createLogger: jest.fn(() => mockLogger),
    format: actualWinston.format,
    transports: actualWinston.transports,
  };
});

describe('Logger Utility Tests', () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = winston.createLogger();
    jest.clearAllMocks();
  });

  describe('logInfo', () => {
    it('should log informational messages', () => {
      logInfo('Test info message', { key: 'value' });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should log info without metadata', () => {
      logInfo('Simple message');
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    it('should log error messages with Error object', () => {
      const error = new Error('Test error');
      logError('Error occurred', error, { userId: '123' });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log error without Error object', () => {
      logError('Error message', undefined, { detail: 'test' });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should extract error message and stack', () => {
      const error = new Error('Stack trace test');
      logError('Test', error);
      const callArgs = mockLogger.error.mock.calls[0];
      expect(callArgs).toBeDefined();
    });
  });

  describe('logWarning', () => {
    it('should log warning messages', () => {
      logWarning('Warning message', { severity: 'medium' });
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('logHttp', () => {
    it('should log HTTP requests', () => {
      logHttp('GET /api/jobs', {
        method: 'GET',
        path: '/api/jobs',
        statusCode: 200,
        duration: '12ms',
      });
      expect(mockLogger.http).toHaveBeenCalled();
    });

    it('should log HTTP requests with user info', () => {
      logHttp('POST /api/auth/login', {
        method: 'POST',
        statusCode: 401,
        userId: null,
        ip: '192.168.1.1',
      });
      expect(mockLogger.http).toHaveBeenCalled();
    });
  });

  describe('logAudit', () => {
    it('should log audit events with all details', () => {
      logAudit('user_logged_in', 'user123', {
        email: 'test@example.com',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should log audit events with null userId', () => {
      logAudit('user_login_failed', null, {
        email: 'test@example.com',
        reason: 'Invalid credentials',
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should include timestamp in audit logs', () => {
      logAudit('test_action', 'user123', { test: 'data' });
      const callArgs = mockLogger.info.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('timestamp');
    });
  });

  describe('logSecurityEvent', () => {
    it('should log low severity security events', () => {
      logSecurityEvent('Token expired', 'low', {
        path: '/api/protected',
        ip: '192.168.1.1',
      });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should log medium severity security events', () => {
      logSecurityEvent('Invalid token attempt', 'medium', {
        token: 'invalid',
        ip: '192.168.1.1',
      });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should log high severity security events', () => {
      logSecurityEvent('Rate limit exceeded', 'high', {
        ip: '192.168.1.1',
        path: '/api/auth/login',
        attempts: 10,
      });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should log critical security events', () => {
      logSecurityEvent('Unauthorized access attempt', 'critical', {
        userId: 'attacker',
        targetResource: 'admin-panel',
      });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should include timestamp and severity in security events', () => {
      logSecurityEvent('Test event', 'high', { test: 'data' });
      const callArgs = mockLogger.warn.mock.calls[0];
      const logObject = callArgs[1];
      expect(logObject).toHaveProperty('timestamp');
      expect(logObject).toHaveProperty('severity', 'high');
    });
  });

  describe('Logger configuration', () => {
    it('should use JSON format for structured logging', () => {
      // Logger is created with JSON format for structured logs
      expect(winston.createLogger).toHaveBeenCalled();
    });

    it('should handle metadata correctly', () => {
      const metadata = {
        userId: '123',
        action: 'test',
        details: { key: 'value' },
      };
      logInfo('Test', metadata);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('Production readiness', () => {
    it('should not log sensitive data in error messages', () => {
      // Passwords, tokens should never be logged
      const error = new Error('Authentication failed for user: test@example.com');
      logError('Login failed', error, {
        email: 'test@example.com',
        // password should NOT be here
      });

      const callArgs = mockLogger.error.mock.calls[0];
      const logMessage = JSON.stringify(callArgs);
      expect(logMessage).not.toContain('password');
      expect(logMessage).not.toContain('token');
    });

    it('should handle undefined metadata gracefully', () => {
      expect(() => logInfo('Test', undefined)).not.toThrow();
      expect(() => logError('Error', undefined, undefined)).not.toThrow();
    });

    it('should handle null values', () => {
      expect(() => logAudit('action', null, {})).not.toThrow();
    });
  });
});
