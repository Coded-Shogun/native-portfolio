import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
} from '../controllers/workHistory.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', createWorkHistory);
router.put('/:id', updateWorkHistory);
router.delete('/:id', deleteWorkHistory);

export default router;
