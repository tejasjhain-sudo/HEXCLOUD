import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import {
  getTrialStatus,
  startDigilockerAuth,
  digilockerCallback,
  createVerificationPayment,
  completeVerification,
} from '../controllers/trialController';

const router = Router();

router.get('/digilocker/callback', digilockerCallback);

router.use(authenticateJWT);

router.get('/status', getTrialStatus);
router.post('/digilocker/start', startDigilockerAuth);
router.post('/verification-payment', createVerificationPayment);
router.post('/complete', completeVerification);

export default router;
