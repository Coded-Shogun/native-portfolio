import { Router } from 'express';
import {
  getPublicPortfolio,
  getMarketplace,
  searchSkills,
} from '../controllers/public.controller';

const router = Router();

// Public routes (no authentication required)
router.get('/portfolio/:slug', getPublicPortfolio);
router.get('/marketplace', getMarketplace);
router.get('/skills', searchSkills);

export default router;
