import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { supabaseAdmin } from '../config/supabase';
import { createRazorpayOrder } from '../services/razorpayService';
import {
  grantTestingTrial,
  isTrialActive,
  trialMsRemaining,
  TRIAL_CREDITS_INR,
  expireTrialIfNeeded,
} from '../services/trialCredits';
import type { DbUser } from '../services/supabaseData';
import { logger } from '../utils/logger';
import {
  buildAuthorizeUrl,
  exchangeAuthorizationCode,
  fetchDigilockerUser,
  generatePkce,
  isDigilockerConfigured,
  maskedAadhaarFromIdToken,
} from '../services/digilockerService';
import crypto from 'crypto';

export const TRIAL_VERIFICATION_FEE_INR = 5;

export function getTrialVerificationState(user: DbUser) {
  const aadhaarVerified = Boolean(user.aadhaar_verified_at);
  const verificationPaid = Boolean(user.trial_verification_paid_at);
  const trialActive = isTrialActive(user.trial_expires_at);
  const trialExpired = Boolean(user.trial_expires_at) && !trialActive;

  let step = 1;
  if (aadhaarVerified) step = 2;
  if (verificationPaid) step = 3;
  if (trialActive) step = 4;

  return {
    step,
    aadhaarVerified,
    aadhaarLast4: user.aadhaar_last4 ?? null,
    verificationPaid,
    trialActive,
    trialExpired,
    trialExpiresAt: user.trial_expires_at ?? null,
    trialMsRemaining: trialMsRemaining(user.trial_expires_at),
    trialCreditsInr: trialActive ? TRIAL_CREDITS_INR : 0,
    verificationFeeInr: TRIAL_VERIFICATION_FEE_INR,
    canStartClaim: !trialActive && !trialExpired,
    digilockerConfigured: isDigilockerConfigured(),
    digilockerName: user.digilocker_verified_name ?? null,
  };
}

export const startDigilockerAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDigilockerConfigured()) {
      return res.status(503).json({
        error: 'DigiLocker is not configured. Add DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET, and DIGILOCKER_REDIRECT_URI on Render.',
        configured: false,
      });
    }

    const { verifier, challenge } = generatePkce();
    const state = crypto.randomBytes(24).toString('base64url');

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        digilocker_oauth_state: state,
        digilocker_code_verifier: verifier,
      })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({
        error: 'DigiLocker columns missing. Run supabase_trial_kyc_migration.sql in Supabase.',
      });
    }

    const authorizeUrl = buildAuthorizeUrl(state, challenge);
    res.json({ authorizeUrl, configured: true });
  } catch (err) {
    next(err);
  }
};

export const digilockerCallback = async (req: AuthenticatedRequest, res: Response) => {
  const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const redirectWith = (params: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    res.redirect(`${frontend}/dashboard?${q}`);
  };

  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const oauthError = req.query.error as string | undefined;

    if (oauthError) {
      return redirectWith({
        digilocker: 'error',
        message: (req.query.error_description as string) || oauthError,
      });
    }

    if (!code || !state) {
      return redirectWith({ digilocker: 'error', message: 'Missing authorization code' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('digilocker_oauth_state', state)
      .maybeSingle();

    if (error || !user?.digilocker_code_verifier) {
      return redirectWith({ digilocker: 'error', message: 'Invalid or expired DigiLocker session' });
    }

    const tokenRes = await exchangeAuthorizationCode(code, user.digilocker_code_verifier);
    const profile = await fetchDigilockerUser(tokenRes.access_token);

    if (profile.eaadhaar !== 'Y') {
      return redirectWith({
        digilocker: 'error',
        message: 'Link your Aadhaar in DigiLocker before continuing',
      });
    }

    const last4 = maskedAadhaarFromIdToken(tokenRes.id_token);

    const { error: upErr } = await supabaseAdmin
      .from('users')
      .update({
        aadhaar_verified_at: new Date().toISOString(),
        aadhaar_last4: last4,
        digilocker_id: profile.digilockerid,
        digilocker_verified_name: profile.name,
        digilocker_oauth_state: null,
        digilocker_code_verifier: null,
        aadhaar_otp_expires_at: null,
      })
      .eq('id', user.id);

    if (upErr) {
      return redirectWith({ digilocker: 'error', message: upErr.message });
    }

    await logger.info(`DigiLocker Aadhaar verified for ${user.email}`, 'TRIAL_KYC');
    return redirectWith({ digilocker: 'verified' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DigiLocker verification failed';
    return redirectWith({ digilocker: 'error', message });
  }
};

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

    const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
    if (error || !user) return res.status(404).json({ error: 'User not found' });

    if (!user.aadhaar_verified_at) {
      return res.status(400).json({ error: 'Complete Aadhaar verification first' });
    }
    if (user.trial_verification_paid_at) {
      return res.status(400).json({ error: 'Verification fee already paid' });
    }

    const order = (await createRazorpayOrder(
      TRIAL_VERIFICATION_FEE_INR,
      `trial_verify_${userId}_${Date.now()}`,
    )) as { id: string; amount: number; currency: string };

    res.json({
      orderId: order.id,
      amount: order.amount / 100,
      amountPaise: order.amount,
      currency: order.currency ?? 'INR',
      description: `HEXCloud identity verification — ₹${TRIAL_VERIFICATION_FEE_INR}`,
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

    const { orderId, paymentId } = z
      .object({ orderId: z.string(), paymentId: z.string().optional() })
      .parse(req.body);

    const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
    if (error || !user) return res.status(404).json({ error: 'User not found' });

    if (!user.aadhaar_verified_at) {
      return res.status(400).json({ error: 'Complete Aadhaar verification first' });
    }

    if (isTrialActive(user.trial_expires_at)) {
      return res.json({
        message: 'Testing credits already active',
        ...getTrialVerificationState(user as DbUser),
      });
    }

    if (!user.trial_verification_paid_at) {
      const payId = paymentId ?? `pay_demo_${orderId}`;
      const { error: payErr } = await supabaseAdmin
        .from('users')
        .update({
          trial_verification_paid_at: new Date().toISOString(),
          trial_verification_payment_id: payId,
        })
        .eq('id', userId);

      if (payErr) return res.status(500).json({ error: payErr.message });

      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        amount: TRIAL_VERIFICATION_FEE_INR,
        type: 'DEBIT',
        description: `Identity verification fee (Order: ${orderId})`,
      });
    }

    const granted = await grantTestingTrial(userId, email);
    if (!granted) {
      return res.status(500).json({ error: 'Could not activate testing credits' });
    }

    res.json({
      message: `₹${TRIAL_CREDITS_INR} testing credits activated for 2 hours`,
      ...getTrialVerificationState(granted),
    });
  } catch (err) {
    next(err);
  }
};
