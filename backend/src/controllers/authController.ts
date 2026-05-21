import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { db } from '../services/supabaseData';
import {
  effectiveWalletBalance,
  isTrialActive,
  trialMsRemaining,
  TRIAL_CREDITS_INR,
  expireTrialIfNeeded,
} from '../services/trialCredits';
import { getTrialVerificationState } from './trialController';

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let user = await db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    user = await expireTrialIfNeeded(user);
    const trialActive = isTrialActive(user.trial_expires_at);
    const trialVerification = getTrialVerificationState(user);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      planType: user.plan_type,
      walletBalance: effectiveWalletBalance(user),
      trialActive,
      trialExpiresAt: user.trial_expires_at ?? null,
      trialCreditsInr: trialActive ? TRIAL_CREDITS_INR : 0,
      trialMsRemaining: trialMsRemaining(user.trial_expires_at),
      trialVerification,
      createdAt: user.created_at,
    });
  } catch (err) {
    next(err);
  }
};
