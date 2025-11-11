import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '../controllers/achievement.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', createAchievement);
router.put('/:id', updateAchievement);
router.delete('/:id', deleteAchievement);

export default router;
