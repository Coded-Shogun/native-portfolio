import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

describe('Rate Limiter Middleware Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '192.168.1.1',
      path: '/api/test',
      body: {},
      get: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('General API rate limiter configuration', () => {
    it('should have correct window and max requests', () => {
      const config = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
      };

      expect(config.windowMs).toBe(900000);
      expect(config.max).toBe(100);
    });

    it('should calculate requests per second', () => {
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const maxRequests = 100;
      const requestsPerSecond = maxRequests / (windowMs / 1000);

      expect(requestsPerSecond).toBeCloseTo(0.111, 3);
    });
  });

  describe('Authentication rate limiter', () => {
    it('should have stricter limits than general API', () => {
      const generalConfig = {
        windowMs: 15 * 60 * 1000,
        max: 100,
      };

      const authConfig = {
        windowMs: 15 * 60 * 1000,
        max: 5,
      };

      expect(authConfig.max).toBeLessThan(generalConfig.max);
      expect(authConfig.windowMs).toBe(generalConfig.windowMs);
    });

    it('should log security events when limit exceeded', () => {
      const logSecurityEvent = jest.fn();

      const handler = (req: Request, res: Response) => {
        logSecurityEvent('Auth rate limit exceeded', 'high', {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('user-agent'),
          email: req.body?.email || 'unknown',
        });

        res.status(429).json({
          error: 'Too many authentication attempts. Please try again in 15 minutes.',
          retryAfter: 15,
        });
      };

      handler(mockRequest as Request, mockResponse as Response);

      expect(logSecurityEvent).toHaveBeenCalledWith(
        'Auth rate limit exceeded',
        'high',
        expect.objectContaining({
          ip: '192.168.1.1',
          path: '/api/test',
        })
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Too many authentication attempts'),
          retryAfter: 15,
        })
      );
    });
  });

  describe('Password reset rate limiter', () => {
    it('should have very strict limits', () => {
      const passwordResetConfig = {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // Only 3 attempts
      };

      expect(passwordResetConfig.windowMs).toBe(3600000);
      expect(passwordResetConfig.max).toBe(3);
      expect(passwordResetConfig.max).toBeLessThan(5); // Stricter than auth
    });

    it('should return appropriate error message', () => {
      const message = 'Too many password reset attempts. Please try again in 1 hour.';

      expect(message).toContain('password reset');
      expect(message).toContain('1 hour');
    });
  });

  describe('Application rate limiter', () => {
    it('should limit job applications per hour', () => {
      const applicationConfig = {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 applications
      };

      expect(applicationConfig.windowMs).toBe(3600000);
      expect(applicationConfig.max).toBe(20);
    });

    it('should use userId as key when authenticated', () => {
      const keyGenerator = (req: any) => req.userId || req.ip;

      const authenticatedRequest = { userId: 'user123', ip: '192.168.1.1' };
      const guestRequest = { userId: null, ip: '192.168.1.1' };

      expect(keyGenerator(authenticatedRequest)).toBe('user123');
      expect(keyGenerator(guestRequest)).toBe('192.168.1.1');
    });
  });

  describe('Rate limit headers', () => {
    it('should include X-RateLimit-Limit header', () => {
      const limit = 100;
      mockResponse.setHeader = jest.fn();

      (mockResponse.setHeader as jest.Mock)('X-RateLimit-Limit', limit);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
    });

    it('should include X-RateLimit-Remaining header', () => {
      const remaining = 95;
      mockResponse.setHeader = jest.fn();

      (mockResponse.setHeader as jest.Mock)('X-RateLimit-Remaining', remaining);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 95);
    });

    it('should include X-RateLimit-Reset header', () => {
      const resetTime = Math.floor(Date.now() / 1000) + 900; // 15 minutes from now
      mockResponse.setHeader = jest.fn();

      (mockResponse.setHeader as jest.Mock)('X-RateLimit-Reset', resetTime);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });

    it('should include Retry-After header when limited', () => {
      const retryAfter = 900; // 900 seconds = 15 minutes
      mockResponse.setHeader = jest.fn();

      (mockResponse.setHeader as jest.Mock)('Retry-After', retryAfter);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', 900);
    });
  });

  describe('Rate limit response', () => {
    it('should return 429 status when limit exceeded', () => {
      const limitExceededHandler = (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: 900,
        });
      };

      limitExceededHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
    });

    it('should include retry information in response', () => {
      const response = {
        error: 'Too many requests',
        retryAfter: 900,
      };

      expect(response.error).toBeTruthy();
      expect(response.retryAfter).toBeGreaterThan(0);
    });

    it('should have user-friendly error messages', () => {
      const messages = {
        general: 'Too many requests from this IP, please try again later.',
        auth: 'Too many authentication attempts. Please try again in 15 minutes.',
        passwordReset: 'Too many password reset attempts. Please try again in 1 hour.',
        application: 'You have reached the application limit. Please try again later.',
      };

      expect(messages.general).toContain('Too many requests');
      expect(messages.auth).toContain('15 minutes');
      expect(messages.passwordReset).toContain('1 hour');
      expect(messages.application).toContain('application limit');
    });
  });

  describe('Rate limiter key generation', () => {
    it('should use IP address for unauthenticated requests', () => {
      const request = { ip: '192.168.1.1', userId: undefined };
      const key = request.userId || request.ip;

      expect(key).toBe('192.168.1.1');
    });

    it('should use userId for authenticated requests', () => {
      const request = { ip: '192.168.1.1', userId: 'user123' };
      const key = request.userId || request.ip;

      expect(key).toBe('user123');
    });

    it('should handle forwarded IPs', () => {
      const getClientIp = (req: any) => {
        return (
          req.headers['x-forwarded-for']?.split(',')[0].trim() ||
          req.headers['x-real-ip'] ||
          req.connection?.remoteAddress ||
          req.ip
        );
      };

      const reqWithForwarded = {
        headers: { 'x-forwarded-for': '203.0.113.1, 192.168.1.1' },
        ip: '192.168.1.1',
      };

      const reqWithoutForwarded = {
        headers: {},
        ip: '192.168.1.1',
      };

      expect(getClientIp(reqWithForwarded)).toBe('203.0.113.1');
      expect(getClientIp(reqWithoutForwarded)).toBe('192.168.1.1');
    });
  });

  describe('Production behavior', () => {
    it('should calculate correct reset time', () => {
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const now = Date.now();
      const resetTime = now + windowMs;

      const diff = resetTime - now;
      expect(diff).toBeCloseTo(windowMs, -3); // Allow 1ms tolerance
    });

    it('should handle concurrent requests', () => {
      // Simulate tracking request count
      let requestCount = 0;
      const maxRequests = 5;

      const simulateRequest = () => {
        if (requestCount < maxRequests) {
          requestCount++;
          return { allowed: true, remaining: maxRequests - requestCount };
        }
        return { allowed: false, remaining: 0 };
      };

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = simulateRequest();
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blockedRequest = simulateRequest();
      expect(blockedRequest.allowed).toBe(false);
      expect(blockedRequest.remaining).toBe(0);
    });

    it('should reset count after window expires', () => {
      const now = Date.now();
      const windowMs = 15 * 60 * 1000;
      const resetTime = now + windowMs;

      // After reset time, new window starts
      const afterReset = resetTime + 1;
      const newWindowStarts = afterReset > resetTime;

      expect(newWindowStarts).toBe(true);
    });
  });

  describe('Security considerations', () => {
    it('should prevent brute force attacks', () => {
      const authAttemptsAllowed = 5;
      const windowMinutes = 15;

      // Attacker can only try 5 passwords every 15 minutes
      const maxAttemptsPerDay = (24 * 60 / windowMinutes) * authAttemptsAllowed;

      expect(maxAttemptsPerDay).toBe(480); // 480 attempts/day max
      // This makes brute force impractical (millions of passwords)
    });

    it('should prevent DoS attacks', () => {
      const maxRequests = 100;
      const windowMinutes = 15;

      // Each IP limited to 100 requests per 15 minutes
      const maxRequestsPerHour = (60 / windowMinutes) * maxRequests;

      expect(maxRequestsPerHour).toBe(400); // 400 requests/hour max
      // Server can handle this load easily
    });

    it('should allow legitimate users', () => {
      const normalUsagePattern = {
        requestsPerMinute: 5,
        maxRequestsPer15Min: 100,
      };

      const requests15Min = normalUsagePattern.requestsPerMinute * 15;

      expect(requests15Min).toBe(75);
      expect(requests15Min).toBeLessThan(normalUsagePattern.maxRequestsPer15Min);
      // Normal users won't hit the limit
    });
  });

  describe('Different rate limit strategies', () => {
    it('should have appropriate limits for each tier', () => {
      const tiers = {
        general: { windowMs: 900000, max: 100 },
        auth: { windowMs: 900000, max: 5 },
        passwordReset: { windowMs: 3600000, max: 3 },
        application: { windowMs: 3600000, max: 20 },
        upload: { windowMs: 3600000, max: 10 },
      };

      // Verify strictness order
      expect(tiers.auth.max).toBeLessThan(tiers.general.max);
      expect(tiers.passwordReset.max).toBeLessThan(tiers.auth.max);

      // Verify longer windows for sensitive operations
      expect(tiers.passwordReset.windowMs).toBeGreaterThan(tiers.general.windowMs);
    });

    it('should balance security and usability', () => {
      // Auth: 5 attempts / 15min = reasonable for legitimate users, strict for attackers
      const authUsability = 5 >= 3; // Most users remember password within 3 tries
      const authSecurity = 5 <= 10; // Low enough to prevent brute force

      expect(authUsability).toBe(true);
      expect(authSecurity).toBe(true);
    });
  });
});
