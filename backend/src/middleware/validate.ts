import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import xss from 'xss';
import { logWarning } from '../utils/logger';

/**
 * CRITICAL FIX: Validation result checker middleware
 *
 * This middleware MUST be used after express-validator rules to actually
 * check if validation passed. Without this, all validation is bypassed!
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
    }));

    logWarning('Validation failed', {
      path: req.path,
      method: req.method,
      errors: errorMessages,
      ip: req.ip,
    });

    return res.status(400).json({
      error: 'Validation failed',
      details: errorMessages,
    });
  }

  next();
};

/**
 * Input sanitization middleware to prevent XSS attacks
 * Sanitizes all string fields in req.body recursively
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return xss(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validation chain helper to reduce boilerplate
 */
export const runValidation = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check results
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      }));

      logWarning('Validation failed', {
        path: req.path,
        method: req.method,
        errors: errorMessages,
        ip: req.ip,
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages,
      });
    }

    next();
  };
};

/**
 * Whitelist middleware to prevent mass assignment vulnerabilities
 * Only allows specified fields to be included in req.body
 */
export const whitelist = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      const filtered: any = {};

      for (const field of allowedFields) {
        if (req.body.hasOwnProperty(field)) {
          filtered[field] = req.body[field];
        }
      }

      req.body = filtered;
    }

    next();
  };
};

export default validate;
