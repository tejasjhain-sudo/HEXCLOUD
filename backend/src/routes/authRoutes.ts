import { Router } from 'express';
import { getProfile } from '../controllers/authController';
import { submitTrialRequest, getMyTrialRequests } from '../controllers/trialRequestController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile', authenticateJWT, getProfile);

// Trial Request routes (user-facing)
router.post('/trial-request', authenticateJWT, submitTrialRequest);
router.get('/trial-requests', authenticateJWT, getMyTrialRequests);

export default router;
