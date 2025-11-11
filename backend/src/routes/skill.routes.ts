import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skill.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
