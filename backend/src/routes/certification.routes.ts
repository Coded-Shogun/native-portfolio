import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createCertification,
  updateCertification,
  deleteCertification,
} from '../controllers/certification.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', createCertification);
router.put('/:id', updateCertification);
router.delete('/:id', deleteCertification);

export default router;
