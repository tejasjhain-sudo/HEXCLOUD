import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { createRazorpayOrder } from '../services/razorpayService';
import {
  grantTestingTrial,
  isTrialActive,
  trialMsRemaining,
  TRIAL_CREDITS_INR,
  expireTrialIfNeeded,
} from '../services/trialCredits';
import type { DbUser } from '../services/supabaseData';
import { supabaseAdmin } from '../config/supabase';

/** Legacy Supabase trial routes — prefer /api/v2/trial with Prisma + anti-abuse */

export const TRIAL_VERIFICATION_FEE_INR = 5;

export function getTrialVerificationState(user: DbUser) {
  const trialActive = isTrialActive(user.trial_expires_at);
  const trialExpired = Boolean(user.trial_expires_at) && !trialActive;

  let step = 1;
  if (trialActive) step = 3;

  return {
    step,
    aadhaarVerified: true,
    aadhaarLast4: user.aadhaar_last4 ?? null,
    verificationPaid: trialActive || trialExpired,
    trialActive,
    trialExpired,
    trialExpiresAt: user.trial_expires_at ?? null,
    trialMsRemaining: trialMsRemaining(user.trial_expires_at),
    trialCreditsInr: trialActive ? TRIAL_CREDITS_INR : 0,
    verificationFeeInr: TRIAL_VERIFICATION_FEE_INR,
    canStartClaim: !trialActive && !trialExpired,
    useV2Api: true,
  };
}

export const getTrialStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
    if (error || !data) return res.status(404).json({ error: 'User not found' });

    const user = (await expireTrialIfNeeded(data as DbUser)) as DbUser;
    res.json(getTrialVerificationState(user));
  } catch (err) {
    next(err);
  }
};

export const createVerificationPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const order = (await createRazorpayOrder(
      TRIAL_VERIFICATION_FEE_INR,
      `trial_verify_${userId}_${Date.now()}`,
    )) as { id: string; amount: number; currency: string };

    res.json({
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency ?? 'INR',
    });
  } catch (err) {
    next(err);
  }
};

export const completeVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    if (!userId || !email) return res.status(401).json({ error: 'Unauthorized' });

    const { orderId, paymentId, fingerprint, turnstileToken } = z
      .object({
        orderId: z.string(),
        paymentId: z.string().optional(),
        fingerprint: z.string().min(16).optional(),
        turnstileToken: z.string().optional(),
      })
      .parse(req.body);

    res.status(410).json({
      error: 'Use POST /api/v2/trial/claim with Turnstile + fingerprint (DigiLocker and ₹5 flow removed)',
      hint: { orderId, paymentId, fingerprint, turnstileToken },
    });
  } catch (err) {
    next(err);
  }
};
