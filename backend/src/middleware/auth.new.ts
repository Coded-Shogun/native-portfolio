import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logSecurityEvent, logWarning } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * ENTERPRISE-GRADE AUTH MIDDLEWARE
 *
 * Security improvements:
 * - Removed JWT_SECRET fallback (will error if not set)
 * - Added structured logging for security events
 * - Verify token issuer and audience
 * - Better error messages
 * - Rate limiting integration ready
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logWarning('Access attempt without token', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(401).json({
      error: 'Access token required',
      message: 'Please provide a valid authentication token',
    });
    return;
  }

  try {
    // CRITICAL FIX: No fallback secret
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'career-portfolio-manager',
      audience: 'career-portfolio-api',
    }) as {
      userId: string;
      email?: string;
      iat: number;
    };

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    // Log security event with details
    if (error instanceof jwt.TokenExpiredError) {
      logSecurityEvent('Expired token used', 'low', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        expiredAt: error.expiredAt,
      });

      res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logSecurityEvent('Invalid token attempt', 'medium', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: error.message,
      });

      res.status(403).json({
        error: 'Invalid token',
        message: 'Your authentication token is invalid. Please log in again.',
        code: 'TOKEN_INVALID',
      });
    } else {
      logSecurityEvent('Token verification failed', 'medium', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(403).json({
        error: 'Authentication failed',
        message: 'Could not verify your authentication. Please log in again.',
        code: 'AUTH_FAILED',
      });
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 * Useful for endpoints that can work with or without authentication
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'career-portfolio-manager',
      audience: 'career-portfolio-api',
    }) as {
      userId: string;
      email?: string;
    };

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
  } catch (error) {
    // Silently fail for optional auth
    // Don't attach userId, proceed without auth
  }

  next();
};

/**
 * Role-based access control middleware
 * Checks if user has required role
 * TODO: Implement when Role model is added to schema
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Fetch user role from database
      // For now, all authenticated users are allowed

      /*
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });

      if (!user || !allowedRoles.includes(user.role)) {
        logSecurityEvent('Unauthorized role access attempt', 'high', {
          userId: req.userId,
          requiredRoles: allowedRoles,
          userRole: user?.role,
          path: req.path,
          ip: req.ip,
        });

        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
        return;
      }
      */

      next();
    } catch (error) {
      logSecurityEvent('Role check failed', 'medium', {
        userId: req.userId,
        path: req.path,
        ip: req.ip,
      });

      res.status(500).json({
        error: 'Authorization check failed',
      });
    }
  };
};

export default authenticateToken;
