import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCareerPreferences,
  saveCareerPreferences,
} from '../controllers/careerPreferences.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', getCareerPreferences);
router.post('/', saveCareerPreferences);

export default router;
