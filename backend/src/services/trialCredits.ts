import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

import type { DbUser } from './supabaseData';

export const TRIAL_CREDITS_INR = 10_000;
export const TRIAL_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
export const DEMO_NODE_NAME = 'HEX-DEMO-SANDBOX-01';

export function isTrialActive(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

export function trialMsRemaining(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0;
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

export function effectiveWalletBalance(user: DbUser): number {
  if (user.trial_expires_at && !isTrialActive(user.trial_expires_at)) return 0;
  return Number(user.wallet_balance);
}

/** Grant ₹10,000 testing credits valid for 2 hours (once per user). */
export async function grantTestingTrial(userId: string, email: string): Promise<DbUser | null> {
  const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
  if (error || !user) return null;

  if (user.role === 'ADMIN') return user as DbUser;

  if (user.trial_expires_at) {
    return expireTrialIfNeeded(user as DbUser);
  }

  const expiresAt = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();
  const { data: updated, error: upErr } = await supabaseAdmin
    .from('users')
    .update({
      wallet_balance: TRIAL_CREDITS_INR,
      trial_expires_at: expiresAt,
    })
    .eq('id', userId)
    .select()
    .single();

  if (upErr) {
    logger.error('Failed to grant testing trial (run supabase_trial_credits_migration.sql)', 'TRIAL', upErr);
    return user as DbUser;
  }

  await supabaseAdmin.from('transactions').insert({
    user_id: userId,
    amount: TRIAL_CREDITS_INR,
    type: 'CREDIT',
    description: `Testing credits — ₹${TRIAL_CREDITS_INR} (expires in 2 hours)`,
  });

  await logger.info(`Testing trial granted to ${email} until ${expiresAt}`, 'TRIAL');
  return updated as DbUser;
}

/** Zero wallet when the 2-hour testing window ends. */
export async function expireTrialIfNeeded(user: DbUser): Promise<DbUser> {
  if (!user.trial_expires_at || isTrialActive(user.trial_expires_at)) {
    return user;
  }

  const { data: updated, error } = await supabaseAdmin
    .from('users')
    .update({ wallet_balance: 0 })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    logger.error('Failed to expire testing trial', 'TRIAL', error);
    return user;
  }

  await logger.info(`Testing trial expired for ${user.email}`, 'TRIAL');
  return updated as DbUser;
}

/** Demo hypervisor node so VPS deploys always have capacity. */
export async function ensureDemoComputeNode(): Promise<string | null> {
  const { data: existing } = await supabaseAdmin
    .from('compute_nodes')
    .select('id')
    .eq('name', DEMO_NODE_NAME)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabaseAdmin
    .from('compute_nodes')
    .insert({
      name: DEMO_NODE_NAME,
      region: 'DEMO-TEST',
      status: 'ONLINE',
      total_cpu: 64,
      used_cpu: 0,
      total_ram_gb: 256,
      used_ram_gb: 0,
      vps_count: 0,
    })
    .select('id')
    .single();

  if (error) {
    logger.error('Failed to create demo compute node', 'COMPUTE', error);
    return null;
  }

  await logger.info(`Demo compute node ${DEMO_NODE_NAME} provisioned`, 'COMPUTE');
  return created.id as string;
}

export async function allocateOnDemoNode(cpu: number, ramMb: number): Promise<void> {
  const nodeId = await ensureDemoComputeNode();
  if (!nodeId) return;

  const { data: node } = await supabaseAdmin.from('compute_nodes').select('*').eq('id', nodeId).single();
  if (!node) return;

  const ramGb = Math.ceil(ramMb / 1024);
  await supabaseAdmin
    .from('compute_nodes')
    .update({
      used_cpu: Math.min(Number(node.total_cpu), Number(node.used_cpu) + cpu),
      used_ram_gb: Math.min(Number(node.total_ram_gb), Number(node.used_ram_gb) + ramGb),
      vps_count: Number(node.vps_count) + 1,
      status: 'ONLINE',
    })
    .eq('id', nodeId);
}
