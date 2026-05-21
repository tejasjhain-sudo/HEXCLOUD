-- HEXCloud: Aadhaar + ₹5 verification before ₹10,000 testing credits
-- Run in Supabase SQL Editor after supabase_trial_credits_migration.sql

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS aadhaar_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS aadhaar_last4 TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_otp_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_verification_paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_verification_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS digilocker_id TEXT,
  ADD COLUMN IF NOT EXISTS digilocker_verified_name TEXT,
  ADD COLUMN IF NOT EXISTS digilocker_oauth_state TEXT,
  ADD COLUMN IF NOT EXISTS digilocker_code_verifier TEXT;
