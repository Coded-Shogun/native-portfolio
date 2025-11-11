import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  getCurrentUser,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
