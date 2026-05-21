-- HEXCloud: 2-hour testing credits + demo compute node
-- Run in Supabase SQL Editor after supabase_setup_all.sql

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE;

INSERT INTO public.compute_nodes (name, region, status, total_cpu, used_cpu, total_ram_gb, used_ram_gb, vps_count)
SELECT 'HEX-DEMO-SANDBOX-01', 'DEMO-TEST', 'ONLINE', 64, 0, 256, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.compute_nodes WHERE name = 'HEX-DEMO-SANDBOX-01');
