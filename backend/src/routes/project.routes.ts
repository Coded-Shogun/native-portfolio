import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
