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

export const TRIAL_VERIFICATION_FEE_INR = 5;
/** Demo OTP for sandbox — replace with UIDAI provider in production */
export const DEMO_AADHAAR_OTP = '123456';

function normalizeAadhaar(raw: string): string {
  return raw.replace(/\s/g, '');
}

function isValidAadhaar(num: string): boolean {
  return /^\d{12}$/.test(num) && num[0] !== '0' && num[0] !== '1';
}

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
    demoOtpHint: process.env.NODE_ENV === 'production' ? undefined : DEMO_AADHAAR_OTP,
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

export const sendAadhaarOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    if (!userId || !email) return res.status(401).json({ error: 'Unauthorized' });

    const { aadhaar } = z.object({ aadhaar: z.string().min(12).max(14) }).parse(req.body);
    const normalized = normalizeAadhaar(aadhaar);
    if (!isValidAadhaar(normalized)) {
      return res.status(400).json({ error: 'Enter a valid 12-digit Aadhaar number' });
    }

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const last4 = normalized.slice(-4);

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        aadhaar_last4: last4,
        aadhaar_otp_expires_at: otpExpires,
        aadhaar_verified_at: null,
      })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({
        error: 'KYC columns missing. Run supabase_trial_kyc_migration.sql in Supabase.',
      });
    }

    await logger.info(`Aadhaar OTP sent (demo) for ${email}, ends ${last4}`, 'TRIAL_KYC');

    res.json({
      message: 'OTP sent to Aadhaar-linked mobile',
      maskedAadhaar: `XXXX-XXXX-${last4}`,
      expiresInMinutes: 10,
      demoOtp: DEMO_AADHAAR_OTP,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyAadhaarOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { otp } = z.object({ otp: z.string().length(6) }).parse(req.body);

    const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
    if (error || !user) return res.status(404).json({ error: 'User not found' });

    if (!user.aadhaar_otp_expires_at || new Date(user.aadhaar_otp_expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'OTP expired. Request a new OTP.' });
    }

    if (otp !== DEMO_AADHAAR_OTP) {
      return res.status(400).json({ error: 'Invalid OTP. Use the code sent to your mobile.' });
    }

    const { error: upErr } = await supabaseAdmin
      .from('users')
      .update({
        aadhaar_verified_at: new Date().toISOString(),
        aadhaar_otp_expires_at: null,
      })
      .eq('id', userId);

    if (upErr) return res.status(500).json({ error: upErr.message });

    res.json({
      message: 'Aadhaar verified successfully',
      aadhaarLast4: user.aadhaar_last4,
      nextStep: 'pay_verification',
    });
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
