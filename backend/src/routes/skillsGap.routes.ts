import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  analyzeSkillsGap,
  getSkillGapHistory,
  getIndustryTrends,
} from '../controllers/skillsGap.controller';

const router = Router();

router.use(authenticateToken);

router.post('/analyze', analyzeSkillsGap);
router.get('/history', getSkillGapHistory);
router.get('/trends', getIndustryTrends);

export default router;
