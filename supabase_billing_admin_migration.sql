-- HEXCloud Billing & Admin extensions
-- Run after supabase_schema.sql in Supabase SQL Editor

-- VPS suspend flag
ALTER TABLE public.vps_instances
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- User account status
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE'
  CHECK (status IN ('ACTIVE', 'SUSPENDED'));

-- Richer invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS provider TEXT CHECK (provider IN ('STRIPE', 'RAZORPAY', 'INTERNAL')),
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Invoice payment status: PAID | PENDING | FAILED (migrate UNPAID → PENDING)
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('PAID', 'PENDING', 'FAILED', 'UNPAID'));
UPDATE public.invoices SET status = 'PENDING' WHERE status = 'UNPAID';

-- Subscriptions
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

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));
CREATE POLICY "subscriptions_manage" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Usage tracking
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

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_select" ON public.usage_records
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));
CREATE POLICY "usage_insert" ON public.usage_records
  FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Payment methods
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

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_methods_own" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Support tickets
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

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_select" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));
CREATE POLICY "tickets_insert" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_admin_update" ON public.support_tickets
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Compute nodes (hypervisor hosts)
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

ALTER TABLE public.compute_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nodes_read" ON public.compute_nodes FOR SELECT USING (true);
CREATE POLICY "nodes_admin" ON public.compute_nodes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Seed default compute nodes
INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-NODE-US-EAST-01', 'US-EAST', 'ONLINE', 128, 42, 512, 186, 12
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-NODE-US-EAST-01');

INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-NODE-EU-WEST-01', 'EU-WEST', 'ONLINE', 96, 28, 384, 142, 8
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-NODE-EU-WEST-01');

INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-NODE-AP-SOUTH-01', 'AP-SOUTH', 'MAINTENANCE', 64, 0, 256, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-NODE-AP-SOUTH-01');

-- Cloud PC early-access waitlist
CREATE TABLE IF NOT EXISTS public.cloud_pc_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.cloud_pc_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert" ON public.cloud_pc_waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "waitlist_read_own" ON public.cloud_pc_waitlist
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Optional: sample support ticket (uses first user in DB)
-- INSERT INTO public.support_tickets (user_id, subject, message, priority)
-- SELECT id, 'VPS connectivity issue', 'Cannot SSH into my node after upgrade.', 'HIGH'
-- FROM public.users LIMIT 1;
