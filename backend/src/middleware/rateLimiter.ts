import rateLimit from 'express-rate-limit';
import { config } from '../config/config';
import { logSecurityEvent } from '../utils/logger';
import { Request, Response } from 'express';

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Rate limit exceeded', 'medium', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
    });

    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60), // minutes
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 * This prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.auth.max, // 5 requests
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Auth rate limit exceeded', 'high', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      email: req.body?.email || 'unknown',
    });

    res.status(429).json({
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: 15, // minutes
    });
  },
});

/**
 * Password reset rate limiter
 * Even stricter limits for password reset to prevent abuse
 * Limits: 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'Too many password reset attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Password reset rate limit exceeded', 'high', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      email: req.body?.email || 'unknown',
    });

    res.status(429).json({
      error: 'Too many password reset attempts. Please try again in 1 hour.',
      retryAfter: 60, // minutes
    });
  },
});

/**
 * Job application rate limiter
 * Prevents spam applications
 * Limits: 20 applications per hour per user
 */
export const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    error: 'Too many job applications. Please slow down and apply thoughtfully.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID instead of IP for authenticated requests
  keyGenerator: (req: Request) => {
    return (req as any).userId || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Application rate limit exceeded', 'low', {
      userId: (req as any).userId,
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      error: 'You are submitting applications too quickly. Please take time to review each opportunity.',
      retryAfter: 60, // minutes
    });
  },
});

/**
 * File upload rate limiter
 * Limits: 10 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Too many file uploads. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).userId || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Upload rate limit exceeded', 'medium', {
      userId: (req as any).userId,
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      error: 'Too many file uploads. Please try again in 1 hour.',
      retryAfter: 60,
    });
  },
});

export default {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  applicationLimiter,
  uploadLimiter,
};
