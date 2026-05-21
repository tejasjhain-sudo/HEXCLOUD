import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import {
  getTrialStatus,
  sendAadhaarOtp,
  verifyAadhaarOtp,
  createVerificationPayment,
  completeVerification,
} from '../controllers/trialController';

const router = Router();

router.use(authenticateJWT);

router.get('/status', getTrialStatus);
router.post('/aadhaar/send-otp', sendAadhaarOtp);
router.post('/aadhaar/verify-otp', verifyAadhaarOtp);
router.post('/verification-payment', createVerificationPayment);
router.post('/complete', completeVerification);

export default router;
