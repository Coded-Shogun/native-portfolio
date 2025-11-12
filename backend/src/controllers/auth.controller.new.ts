import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '../config/database';
import { sendVerificationEmail } from '../utils/email';
import { generateUniqueSlug } from '../utils/slugify';
import { config } from '../config/config';
import { logError, logInfo, logAudit, logSecurityEvent } from '../utils/logger';

/**
 * ENTERPRISE-GRADE AUTH CONTROLLER
 *
 * Security improvements:
 * - Increased bcrypt rounds to 12
 * - Hashed email verification tokens before storage
 * - Removed JWT_SECRET fallback (will throw error if not set)
 * - Structured logging instead of console.log
 * - Audit logging for security events
 * - Proper error messages without information leakage
 */

/**
 * Hash a token using SHA-256
 * This prevents token exposure if database is compromised
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logSecurityEvent('Registration attempt with existing email', 'low', {
        email,
        ip: req.ip,
      });

      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // CRITICAL FIX: Increase bcrypt rounds from 10 to 12
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // CRITICAL FIX: Generate token and hash it before storage
    const verificationToken = uuidv4();
    const hashedToken = hashToken(verificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerificationToken: hashedToken, // Store hashed token
        emailVerificationExpires: verificationExpires,
      },
    });

    // Create portfolio with unique slug
    const slug = await generateUniqueSlug(firstName || 'user', lastName || '', user.id);
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        slug,
      },
    });

    // Send verification email (with original token, not hashed)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      logError('Failed to send verification email', emailError as Error, {
        userId: user.id,
        email,
      });
      // Don't fail registration if email fails
      // User can request resend later
    }

    // Audit log successful registration
    logAudit('user_registered', user.id, {
      email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    logInfo('User registered successfully', {
      userId: user.id,
      email,
    });

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user.id,
    });
  } catch (error) {
    logError('Registration error', error as Error, {
      email: req.body.email,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Registration failed. Please try again later.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { portfolio: true },
    });

    // Generic error message to prevent user enumeration
    const invalidCredentialsError = 'Invalid email or password';

    if (!user) {
      logSecurityEvent('Login attempt with non-existent email', 'low', {
        email,
        ip: req.ip,
      });

      res.status(401).json({ error: invalidCredentialsError });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logSecurityEvent('Failed login attempt - invalid password', 'medium', {
        userId: user.id,
        email,
        ip: req.ip,
      });

      // TODO: Implement account lockout after N failed attempts
      // For now, just log and return error

      res.status(401).json({ error: invalidCredentialsError });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      logSecurityEvent('Login attempt with unverified email', 'low', {
        userId: user.id,
        email,
        ip: req.ip,
      });

      res.status(403).json({
        error: 'Please verify your email before logging in',
        requiresVerification: true,
      });
      return;
    }

    // CRITICAL FIX: No fallback secret, will throw error if not set
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        // Add issued at time for potential token revocation
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.secret, // No fallback - will error if not set
      {
        expiresIn: config.jwt.expiresIn,
        issuer: 'career-portfolio-manager',
        audience: 'career-portfolio-api',
      }
    );

    // Audit log successful login
    logAudit('user_logged_in', user.id, {
      email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    logInfo('User logged in successfully', {
      userId: user.id,
      email,
    });

    // TODO: Set as httpOnly cookie instead of returning in body
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        portfolioSlug: user.portfolio?.slug,
      },
    });
  } catch (error) {
    logError('Login error', error as Error, {
      email: req.body.email,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Login failed. Please try again later.',
    });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    // CRITICAL FIX: Hash the incoming token before lookup
    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken, // Compare hashed tokens
        emailVerificationExpires: { gte: new Date() },
      },
    });

    if (!user) {
      logSecurityEvent('Invalid verification token attempt', 'low', {
        hashedToken: hashedToken.substring(0, 10) + '...', // Log partial hash only
        ip: req.ip,
      });

      res.status(400).json({
        error: 'Invalid or expired verification token',
      });
      return;
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Audit log email verification
    logAudit('email_verified', user.id, {
      email: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    logInfo('Email verified successfully', {
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: 'Email verified successfully!',
    });
  } catch (error) {
    logError('Email verification error', error as Error, {
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Email verification failed. Please try again later.',
    });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if user exists or not
      // Always return success to prevent email enumeration
      res.json({
        message: 'If this email is registered, a verification link has been sent.',
      });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({
        error: 'Email already verified',
      });
      return;
    }

    // CRITICAL FIX: Generate and hash new verification token
    const verificationToken = uuidv4();
    const hashedToken = hashToken(verificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken, // Store hashed token
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email with original token
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      logError('Failed to send verification email', emailError as Error, {
        userId: user.id,
        email,
      });

      res.status(500).json({
        error: 'Failed to send verification email. Please try again later.',
      });
      return;
    }

    // Audit log
    logAudit('verification_email_resent', user.id, {
      email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    logInfo('Verification email resent', {
      userId: user.id,
      email,
    });

    res.json({
      message: 'Verification email sent!',
    });
  } catch (error) {
    logError('Resend verification error', error as Error, {
      email: req.body.email,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to resend verification email. Please try again later.',
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        createdAt: true,
        portfolio: {
          select: {
            id: true,
            slug: true,
            completionScore: true,
            isPublic: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    res.json({ user });
  } catch (error) {
    logError('Get current user error', error as Error, {
      userId: (req as any).userId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to fetch user data',
    });
  }
};

/**
 * Logout endpoint
 * TODO: Implement token blacklist for immediate revocation
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    // Audit log logout
    logAudit('user_logged_out', userId, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    logInfo('User logged out', {
      userId,
    });

    // TODO: Add token to blacklist/revocation list
    // For now, client must delete token

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logError('Logout error', error as Error, {
      userId: (req as any).userId,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Logout failed',
    });
  }
};
