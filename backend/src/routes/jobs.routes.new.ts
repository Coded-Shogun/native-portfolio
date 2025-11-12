import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { validate, whitelist } from '../middleware/validate';
import { applicationLimiter } from '../middleware/rateLimiter';
import {
  getJobRecommendations,
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
  saveJob,
  getSavedJobs,
  removeSavedJob,
} from '../controllers/jobs.controller';

/**
 * ENTERPRISE-GRADE JOBS ROUTES
 *
 * Security improvements:
 * - Added validation middleware for all inputs
 * - Added rate limiting on application submission
 * - Added whitelist middleware to prevent mass assignment
 * - UUID validation for all IDs
 * - Proper query parameter validation
 */

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ==========================================
// VALIDATION RULES
// ==========================================

const getRecommendationsValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('minScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Min score must be between 0 and 100'),
];

const applyToJobValidation = [
  param('jobId')
    .isUUID()
    .withMessage('Invalid job ID format'),

  body('coverLetter')
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Cover letter must be less than 5000 characters'),

  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

const getApplicationsValidation = [
  query('status')
    .optional()
    .isIn(['submitted', 'reviewing', 'interview', 'assessment', 'offer', 'accepted', 'rejected', 'declined'])
    .withMessage('Invalid status'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive number'),
];

const updateApplicationValidation = [
  param('applicationId')
    .isUUID()
    .withMessage('Invalid application ID format'),

  body('status')
    .isIn(['submitted', 'reviewing', 'interview', 'assessment', 'offer', 'accepted', 'rejected', 'declined'])
    .withMessage('Invalid status'),

  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

const jobIdValidation = [
  param('jobId')
    .isUUID()
    .withMessage('Invalid job ID format'),
];

// ==========================================
// ROUTES
// ==========================================

/**
 * GET /api/jobs/recommendations
 * Get AI-powered job recommendations based on user's portfolio
 *
 * Query params:
 *   - limit: number (1-100, default 10)
 *   - minScore: number (0-100, default 60)
 *
 * Returns: Array of job matches with scores, reasons, and suggestions
 */
router.get(
  '/recommendations',
  getRecommendationsValidation,
  validate,
  getJobRecommendations
);

/**
 * POST /api/jobs/:jobId/apply
 * Submit application to a job
 *
 * Rate Limited: 20 applications per hour per user
 *
 * Body: { coverLetter?: string, notes?: string }
 * Returns: { message, application }
 */
router.post(
  '/:jobId/apply',
  applicationLimiter, // ADDED: Rate limiting to prevent spam applications
  applyToJobValidation,
  validate,
  whitelist(['coverLetter', 'notes']), // ADDED: Prevent mass assignment
  applyToJob
);

/**
 * GET /api/jobs/applications/me
 * Get current user's job applications
 *
 * Query params:
 *   - status?: string (submitted, reviewing, interview, etc.)
 *   - limit?: number (1-100, default 50)
 *   - offset?: number (default 0)
 *
 * Returns: { applications, pagination, stats }
 */
router.get(
  '/applications/me',
  getApplicationsValidation,
  validate,
  getMyApplications
);

/**
 * PUT /api/jobs/applications/:applicationId
 * Update application status and notes
 *
 * Body: { status, notes?: string }
 * Returns: { message, application }
 */
router.put(
  '/applications/:applicationId',
  updateApplicationValidation,
  validate,
  whitelist(['status', 'notes']), // ADDED: Prevent mass assignment
  updateApplicationStatus
);

/**
 * POST /api/jobs/:jobId/save
 * Save/bookmark a job for later
 *
 * Returns: { message }
 */
router.post(
  '/:jobId/save',
  jobIdValidation,
  validate,
  saveJob
);

/**
 * GET /api/jobs/saved/me
 * Get user's saved jobs
 *
 * Returns: { savedJobs, total }
 */
router.get(
  '/saved/me',
  getSavedJobs
);

/**
 * DELETE /api/jobs/:jobId/save
 * Remove a saved job
 *
 * Returns: { message }
 */
router.delete(
  '/:jobId/save',
  jobIdValidation,
  validate,
  removeSavedJob
);

export default router;
