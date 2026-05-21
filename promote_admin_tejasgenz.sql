-- Run ONLY after tables exist.
-- If you see "relation public.users does not exist", run supabase_setup_all.sql first.

INSERT INTO public.users (id, email, role, plan_type, wallet_balance, status)
SELECT id, email, 'ADMIN', 'PRO', 100.00, 'ACTIVE'
FROM auth.users
WHERE email = 'tejasgenz@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', plan_type = 'PRO', status = 'ACTIVE';

SELECT id, email, role, plan_type, wallet_balance, status
FROM public.users
WHERE email = 'tejasgenz@gmail.com';
