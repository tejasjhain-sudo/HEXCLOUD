import { Router } from 'express';
import { getProfile } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile', authenticateJWT, getProfile);

export default router;
