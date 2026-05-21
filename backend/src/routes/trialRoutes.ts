import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { getTrialStatus } from '../controllers/trialController';

const router = Router();

router.use(authenticateJWT);
router.get('/status', getTrialStatus);

export default router;
