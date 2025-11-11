import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getMyPortfolio,
  updatePortfolio,
  getPortfolioStats,
} from '../controllers/portfolio.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/me', getMyPortfolio);
router.put('/me', updatePortfolio);
router.get('/stats', getPortfolioStats);

export default router;
