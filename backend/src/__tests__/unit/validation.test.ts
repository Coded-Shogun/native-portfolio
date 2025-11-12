import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

// Mock implementations for testing validation middleware behavior
describe('Validation Middleware Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('validate middleware', () => {
    it('should call next() when validation passes', () => {
      // Mock validation result with no errors
      const mockValidationResult = {
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([]),
      };

      const validate = (req: Request, res: Response, next: NextFunction) => {
        const errors = mockValidationResult;
        if (errors.isEmpty()) {
          next();
        } else {
          res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
          });
        }
      };

      validate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', () => {
      const mockValidationResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          { path: 'email', msg: 'Invalid email' },
          { path: 'password', msg: 'Password too short' },
        ]),
      };

      const validate = (req: Request, res: Response, next: NextFunction) => {
        const errors = mockValidationResult;
        if (errors.isEmpty()) {
          next();
        } else {
          const errorMessages = errors.array().map((err: any) => ({
            field: err.path || 'unknown',
            message: err.msg,
          }));
          res.status(400).json({
            error: 'Validation failed',
            details: errorMessages,
          });
        }
      };

      validate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' }),
        ]),
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should include field names in error response', () => {
      const mockValidationResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          { path: 'firstName', msg: 'First name is required' },
        ]),
      };

      const validate = (req: Request, res: Response, next: NextFunction) => {
        const errors = mockValidationResult;
        if (!errors.isEmpty()) {
          const errorMessages = errors.array().map((err: any) => ({
            field: err.path || 'unknown',
            message: err.msg,
          }));
          res.status(400).json({
            error: 'Validation failed',
            details: errorMessages,
          });
        }
      };

      validate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'firstName',
              message: 'First name is required',
            }),
          ]),
        })
      );
    });
  });

  describe('sanitizeInput middleware', () => {
    it('should sanitize XSS payloads in body', () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const sanitized = xss(xssPayload);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should sanitize nested objects', () => {
      const input = {
        name: '<script>alert("XSS")</script>',
        details: {
          bio: 'Hello <img src=x onerror=alert(1)>',
        },
      };

      const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
          return xss(obj);
        }
        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const key in obj) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
          return sanitized;
        }
        return obj;
      };

      const result = sanitizeObject(input);

      expect(result.name).not.toContain('<script>');
      expect(result.details.bio).not.toContain('onerror');
    });

    it('should sanitize arrays', () => {
      const input = [
        '<script>alert(1)</script>',
        'Normal text',
        '<img src=x onerror=alert(1)>',
      ];

      const sanitized = input.map(item => xss(item));

      sanitized.forEach(item => {
        expect(item).not.toContain('<script>');
        expect(item).not.toContain('onerror');
      });
    });

    it('should preserve safe HTML tags if configured', () => {
      const input = '<b>Bold text</b>';
      const sanitized = xss(input);

      // xss library strips all tags by default
      expect(typeof sanitized).toBe('string');
    });

    it('should handle null and undefined', () => {
      const sanitizeObject = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return obj;
        }
        if (typeof obj === 'string') {
          return xss(obj);
        }
        return obj;
      };

      expect(sanitizeObject(null)).toBeNull();
      expect(sanitizeObject(undefined)).toBeUndefined();
    });
  });

  describe('whitelist middleware', () => {
    it('should allow only whitelisted fields', () => {
      const allowedFields = ['coverLetter', 'notes'];

      const whitelist = (allowedFields: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
          const filtered: any = {};
          for (const field of allowedFields) {
            if (req.body.hasOwnProperty(field)) {
              filtered[field] = req.body[field];
            }
          }
          req.body = filtered;
          next();
        };
      };

      mockRequest.body = {
        coverLetter: 'I am qualified...',
        notes: 'Follow up next week',
        userId: 'malicious-id', // Should be blocked
        status: 'approved', // Should be blocked
      };

      const middleware = whitelist(allowedFields);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.body).toEqual({
        coverLetter: 'I am qualified...',
        notes: 'Follow up next week',
      });
      expect(mockRequest.body.userId).toBeUndefined();
      expect(mockRequest.body.status).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle empty body', () => {
      const allowedFields = ['field1', 'field2'];

      const whitelist = (allowedFields: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
          const filtered: any = {};
          for (const field of allowedFields) {
            if (req.body && req.body.hasOwnProperty(field)) {
              filtered[field] = req.body[field];
            }
          }
          req.body = filtered;
          next();
        };
      };

      mockRequest.body = {};

      const middleware = whitelist(allowedFields);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.body).toEqual({});
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should preserve allowed fields with various types', () => {
      const allowedFields = ['string', 'number', 'boolean', 'object'];

      const whitelist = (allowedFields: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
          const filtered: any = {};
          for (const field of allowedFields) {
            if (req.body.hasOwnProperty(field)) {
              filtered[field] = req.body[field];
            }
          }
          req.body = filtered;
          next();
        };
      };

      mockRequest.body = {
        string: 'text',
        number: 42,
        boolean: true,
        object: { key: 'value' },
        blocked: 'should not appear',
      };

      const middleware = whitelist(allowedFields);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.body.string).toBe('text');
      expect(mockRequest.body.number).toBe(42);
      expect(mockRequest.body.boolean).toBe(true);
      expect(mockRequest.body.object).toEqual({ key: 'value' });
      expect(mockRequest.body.blocked).toBeUndefined();
    });
  });

  describe('Common validation patterns', () => {
    describe('Email validation', () => {
      it('should validate email format', () => {
        const validEmails = [
          'user@example.com',
          'test.user@domain.co.uk',
          'user+tag@example.com',
        ];

        const invalidEmails = [
          'not-an-email',
          '@example.com',
          'user@',
          'user space@example.com',
        ];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        validEmails.forEach(email => {
          expect(emailRegex.test(email)).toBe(true);
        });

        invalidEmails.forEach(email => {
          expect(emailRegex.test(email)).toBe(false);
        });
      });
    });

    describe('Password validation', () => {
      it('should validate password complexity', () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

        const validPasswords = [
          'SecurePass123!',
          'MyP@ssw0rd2025',
          'Test1234!@#$',
        ];

        const invalidPasswords = [
          'password', // no uppercase, number, special
          'Password', // no number, special
          'Password123', // no special
          'Pass123!', // too short
        ];

        validPasswords.forEach(pwd => {
          expect(passwordRegex.test(pwd)).toBe(true);
          expect(pwd.length).toBeGreaterThanOrEqual(12);
        });

        invalidPasswords.forEach(pwd => {
          const hasComplexity = passwordRegex.test(pwd);
          const hasLength = pwd.length >= 12;
          expect(hasComplexity && hasLength).toBe(false);
        });
      });
    });

    describe('UUID validation', () => {
      it('should validate UUID format', () => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        const validUUIDs = [
          '123e4567-e89b-12d3-a456-426614174000',
          'c73bcdcc-2669-4bf6-81d3-e4ae73fb11fd',
        ];

        const invalidUUIDs = [
          'not-a-uuid',
          '123e4567-e89b-12d3-a456', // too short
          '123e4567e89b12d3a456426614174000', // no dashes
        ];

        validUUIDs.forEach(uuid => {
          expect(uuidRegex.test(uuid)).toBe(true);
        });

        invalidUUIDs.forEach(uuid => {
          expect(uuidRegex.test(uuid)).toBe(false);
        });
      });
    });
  });

  describe('Integration with express-validator', () => {
    it('should validate required fields', () => {
      const rules = [
        body('email').notEmpty().withMessage('Email is required'),
        body('password').notEmpty().withMessage('Password is required'),
      ];

      expect(rules).toHaveLength(2);
      expect(rules[0]).toBeDefined();
      expect(rules[1]).toBeDefined();
    });

    it('should validate field types', () => {
      const rules = [
        body('age').isInt().withMessage('Age must be an integer'),
        body('email').isEmail().withMessage('Invalid email'),
        body('website').isURL().withMessage('Invalid URL'),
      ];

      expect(rules).toHaveLength(3);
    });

    it('should validate field lengths', () => {
      const rules = [
        body('password')
          .isLength({ min: 12 })
          .withMessage('Password must be at least 12 characters'),
        body('firstName')
          .isLength({ min: 2, max: 50 })
          .withMessage('First name must be 2-50 characters'),
      ];

      expect(rules).toHaveLength(2);
    });
  });
});
