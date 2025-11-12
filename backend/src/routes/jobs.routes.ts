import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getJobRecommendations,
  applyToJob,
  getMyApplications,
  updateApplication,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  browseJobs,
  getJobDetails,
} from '../controllers/jobs.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Job Recommendations (AI-powered matching)
router.get('/recommendations', getJobRecommendations);

// Browse Jobs
router.get('/browse', browseJobs);
router.get('/:id', getJobDetails);

// Applications
router.post('/:jobId/apply', applyToJob);
router.get('/applications/me', getMyApplications);
router.put('/applications/:id', updateApplication);

// Saved Jobs
router.post('/:jobId/save', saveJob);
router.get('/saved/me', getSavedJobs);
router.delete('/:jobId/save', removeSavedJob);

export default router;
