import { Router } from 'express';
import {
  createCheckoutSession,
  completeCheckoutMock,
  changePlan,
  getTransactions,
  getInvoices,
  getBillingSummary,
  createStripeSession,
  createRazorpayOrderHandler,
} from '../controllers/billingController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/checkout/session', createCheckoutSession);
router.post('/stripe/checkout', createStripeSession);
router.post('/razorpay/order', createRazorpayOrderHandler);
router.post('/checkout/complete-mock', completeCheckoutMock);
router.post('/change-plan', changePlan);
router.get('/summary', getBillingSummary);
router.get('/transactions', getTransactions);
router.get('/invoices', getInvoices);

export default router;
