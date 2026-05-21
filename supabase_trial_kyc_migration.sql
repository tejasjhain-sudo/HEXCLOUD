-- Legacy Supabase columns (optional). Primary trial system uses Prisma PostgreSQL.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS aadhaar_last4 TEXT;
