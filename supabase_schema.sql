-- HEXCloud Database Schema
-- Run this in your Supabase SQL Editor to initialize all required tables.

-- Create Users table (syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  plan_type TEXT DEFAULT 'FREE' CHECK (plan_type IN ('FREE', 'BASIC', 'PRO')),
  wallet_balance NUMERIC(10, 2) DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) or leave it disabled for development
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.users 
  FOR SELECT USING (true);

CREATE POLICY "Allow individual write access" ON public.users 
  FOR ALL USING (auth.uid() = id);

-- Create VPS Instances Table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vps_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read vps" ON public.vps_instances
  FOR SELECT USING (true);

CREATE POLICY "Allow individual manage vps" ON public.vps_instances
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Create GPU Sessions Table
CREATE TABLE IF NOT EXISTS public.gpu_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  gpu_type TEXT NOT NULL CHECK (gpu_type IN ('RTX_3080', 'RTX_4090', 'A10G')),
  status TEXT DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'ACTIVE', 'ENDED')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gpu_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read sessions" ON public.gpu_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow individual manage sessions" ON public.gpu_sessions
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT CHECK (type IN ('CREDIT', 'DEBIT')) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

CREATE POLICY "Allow insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'PAID' CHECK (status IN ('PAID', 'UNPAID')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

CREATE POLICY "Allow insert invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create System Logs Table
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT CHECK (level IN ('INFO', 'WARN', 'ERROR')) NOT NULL,
  message TEXT NOT NULL,
  service TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read logs" ON public.system_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

CREATE POLICY "Allow public insert logs" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- Enable Replication for Realtime updates on tables
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.vps_instances REPLICA IDENTITY FULL;
ALTER TABLE public.gpu_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.system_logs REPLICA IDENTITY FULL;
