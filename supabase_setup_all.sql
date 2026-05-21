-- =============================================================================
-- HEXCloud — FULL DATABASE SETUP (run once in Supabase SQL Editor)
-- Project: https://supabase.com/dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ─── 1. CORE TABLES ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  plan_type TEXT DEFAULT 'FREE' CHECK (plan_type IN ('FREE', 'BASIC', 'PRO')),
  wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
  trial_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vps_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PROVISIONING' CHECK (status IN ('PROVISIONING', 'RUNNING', 'STOPPED', 'ERROR')),
  ip_address TEXT NOT NULL,
  os_type TEXT NOT NULL,
  cpu INTEGER NOT NULL,
  ram INTEGER NOT NULL,
  storage INTEGER NOT NULL,
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gpu_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  gpu_type TEXT NOT NULL CHECK (gpu_type IN ('RTX_3080', 'RTX_4090', 'A10G')),
  status TEXT DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'ACTIVE', 'ENDED')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT CHECK (type IN ('CREDIT', 'DEBIT')) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'PAID' CHECK (status IN ('PAID', 'PENDING', 'FAILED', 'UNPAID')),
  provider TEXT CHECK (provider IN ('STRIPE', 'RAZORPAY', 'INTERNAL')),
  external_id TEXT,
  invoice_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT CHECK (level IN ('INFO', 'WARN', 'ERROR')) NOT NULL,
  message TEXT NOT NULL,
  service TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('FREE', 'BASIC', 'PRO')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING')),
  billing_cycle TEXT DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
  amount NUMERIC(10, 2) DEFAULT 0,
  provider TEXT CHECK (provider IN ('STRIPE', 'RAZORPAY', 'INTERNAL')),
  external_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('VPS', 'GPU', 'STORAGE', 'NETWORK')),
  resource_label TEXT NOT NULL,
  quantity NUMERIC(12, 4) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'hours',
  cost NUMERIC(10, 4) NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('STRIPE', 'RAZORPAY')),
  brand TEXT NOT NULL,
  last4 TEXT NOT NULL,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.compute_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  status TEXT DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'MAINTENANCE', 'OFFLINE')),
  total_cpu INTEGER NOT NULL DEFAULT 64,
  used_cpu INTEGER NOT NULL DEFAULT 0,
  total_ram_gb INTEGER NOT NULL DEFAULT 256,
  used_ram_gb INTEGER NOT NULL DEFAULT 0,
  vps_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cloud_pc_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 2. ROW LEVEL SECURITY ───────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vps_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpu_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_pc_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.users;
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow individual write access" ON public.users;
CREATE POLICY "Allow individual write access" ON public.users FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow public read vps" ON public.vps_instances;
CREATE POLICY "Allow public read vps" ON public.vps_instances FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow individual manage vps" ON public.vps_instances;
CREATE POLICY "Allow individual manage vps" ON public.vps_instances
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Allow public read sessions" ON public.gpu_sessions;
CREATE POLICY "Allow public read sessions" ON public.gpu_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow individual manage sessions" ON public.gpu_sessions;
CREATE POLICY "Allow individual manage sessions" ON public.gpu_sessions
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Allow individual transactions" ON public.transactions;
CREATE POLICY "Allow individual transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Allow insert transactions" ON public.transactions;
CREATE POLICY "Allow insert transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual invoices" ON public.invoices;
CREATE POLICY "Allow individual invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Allow insert invoices" ON public.invoices;
CREATE POLICY "Allow insert invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow admin read logs" ON public.system_logs;
CREATE POLICY "Allow admin read logs" ON public.system_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Allow public insert logs" ON public.system_logs;
CREATE POLICY "Allow public insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "subscriptions_manage" ON public.subscriptions;
CREATE POLICY "subscriptions_manage" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "usage_select" ON public.usage_records;
CREATE POLICY "usage_select" ON public.usage_records
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "usage_insert" ON public.usage_records;
CREATE POLICY "usage_insert" ON public.usage_records
  FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "payment_methods_own" ON public.payment_methods;
CREATE POLICY "payment_methods_own" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "tickets_select" ON public.support_tickets;
CREATE POLICY "tickets_select" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "tickets_insert" ON public.support_tickets;
CREATE POLICY "tickets_insert" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_admin_update" ON public.support_tickets;
CREATE POLICY "tickets_admin_update" ON public.support_tickets
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "nodes_read" ON public.compute_nodes;
CREATE POLICY "nodes_read" ON public.compute_nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "nodes_admin" ON public.compute_nodes;
CREATE POLICY "nodes_admin" ON public.compute_nodes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "waitlist_insert" ON public.cloud_pc_waitlist;
CREATE POLICY "waitlist_insert" ON public.cloud_pc_waitlist FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "waitlist_read_own" ON public.cloud_pc_waitlist;
CREATE POLICY "waitlist_read_own" ON public.cloud_pc_waitlist
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Realtime
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.vps_instances REPLICA IDENTITY FULL;
ALTER TABLE public.gpu_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.system_logs REPLICA IDENTITY FULL;

-- ─── 3. SEED COMPUTE NODES ───────────────────────────────────────────────────

INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-NODE-US-EAST-01', 'US-EAST', 'ONLINE', 128, 42, 512, 186, 12
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-NODE-US-EAST-01');

INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-NODE-EU-WEST-01', 'EU-WEST', 'ONLINE', 96, 28, 384, 142, 8
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-NODE-EU-WEST-01');

INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-NODE-AP-SOUTH-01', 'AP-SOUTH', 'MAINTENANCE', 64, 0, 256, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-NODE-AP-SOUTH-01');

INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-DEMO-SANDBOX-01', 'DEMO-TEST', 'ONLINE', 64, 0, 256, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-DEMO-SANDBOX-01');

-- ─── 4. MAKE tejasgenz@gmail.com ADMIN ───────────────────────────────────────
-- Requires this email to exist in Authentication (sign up in the app first).

INSERT INTO public.users (id, email, role, plan_type, wallet_balance, status)
SELECT id, email, 'ADMIN', 'PRO', 100.00, 'ACTIVE'
FROM auth.users
WHERE email = 'tejasgenz@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'ADMIN',
  email = EXCLUDED.email,
  plan_type = 'PRO',
  wallet_balance = GREATEST(public.users.wallet_balance, 100.00),
  status = 'ACTIVE';

-- Verify
SELECT id, email, role, plan_type, wallet_balance, status
FROM public.users
WHERE email = 'tejasgenz@gmail.com';
