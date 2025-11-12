import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  logout,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

/**
 * ENTERPRISE-GRADE AUTH ROUTES
 *
 * Security improvements:
 * - Added validate middleware to check validation results (CRITICAL FIX)
 * - Strengthened password requirements (12 chars, complexity)
 * - Added rate limiting on auth endpoints
 * - Added logout endpoint
 * - Proper error messages
 */

const router = Router();

// ==========================================
// VALIDATION RULES
// ==========================================

/**
 * Registration validation with strong password requirements
 * CRITICAL FIX: Increased from 8 to 12 characters with complexity
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
    .custom((value) => {
      // Additional email validation
      if (value && value.length > 254) {
        throw new Error('Email is too long');
      }
      return true;
    }),

  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    ),

  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
];

/**
 * Login validation
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Email verification validation
 */
const verifyEmailValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isUUID()
    .withMessage('Invalid verification token format'),
];

/**
 * Resend verification validation
 */
const resendVerificationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

// ==========================================
// ROUTES
// ==========================================

/**
 * POST /api/auth/register
 * Register a new user account
 *
 * Rate Limited: 5 requests per 15 minutes per IP
 * Body: { email, password, firstName, lastName }
 */
router.post(
  '/register',
  authLimiter, // ADDED: Rate limiting
  registerValidation,
  validate, // CRITICAL FIX: Actually check validation results!
  register
);

/**
 * POST /api/auth/login
 * Login with email and password
 *
 * Rate Limited: 5 requests per 15 minutes per IP
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post(
  '/login',
  authLimiter, // ADDED: Rate limiting
  loginValidation,
  validate, // CRITICAL FIX: Actually check validation results!
  login
);

/**
 * POST /api/auth/verify-email
 * Verify email address with token from email
 *
 * Body: { token }
 */
router.post(
  '/verify-email',
  verifyEmailValidation,
  validate, // ADDED: Validation checking
  verifyEmail
);

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 *
 * Rate Limited: 5 requests per 15 minutes per IP
 * Body: { email }
 */
router.post(
  '/resend-verification',
  authLimiter, // ADDED: Rate limiting
  resendVerificationValidation,
  validate, // ADDED: Validation checking
  resendVerification
);

/**
 * GET /api/auth/me
 * Get current authenticated user's information
 *
 * Requires: Authentication (JWT token in Authorization header)
 * Returns: { user: { id, email, firstName, lastName, portfolio } }
 */
router.get(
  '/me',
  authenticateToken,
  getCurrentUser
);

/**
 * POST /api/auth/logout
 * Logout current user
 *
 * Requires: Authentication (JWT token in Authorization header)
 * Note: Currently client-side token deletion, server-side blacklist pending
 */
router.post(
  '/logout',
  authenticateToken,
  logout
);

/**
 * POST /api/auth/forgot-password (TODO: Implement)
 * Request password reset email
 *
 * Rate Limited: 3 requests per hour per IP
 * Body: { email }
 */
// router.post(
//   '/forgot-password',
//   passwordResetLimiter,
//   [body('email').isEmail().normalizeEmail()],
//   validate,
//   forgotPassword
// );

/**
 * POST /api/auth/reset-password (TODO: Implement)
 * Reset password with token from email
 *
 * Body: { token, newPassword }
 */
// router.post(
//   '/reset-password',
//   [
//     body('token').notEmpty().isUUID(),
//     body('newPassword')
//       .isLength({ min: 12 })
//       .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
//   ],
//   validate,
//   resetPassword
// );

export default router;
