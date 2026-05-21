import { supabaseAdmin } from '../config/supabase';
import { grantTestingTrial, expireTrialIfNeeded } from './trialCredits';

export type DbUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan_type: string;
  wallet_balance: number;
  trial_expires_at?: string | null;
  status?: string;
  created_at: string;
};

function throwDb(error: { message: string } | null, ctx: string): never {
  throw new Error(error?.message || `Database error: ${ctx}`);
}

export const db = {
  async getUserById(id: string): Promise<DbUser | null> {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throwDb(error, 'getUserById');
    if (!data) return null;
    const user = data as DbUser;
    return expireTrialIfNeeded(user);
  },

  async getUserByEmail(email: string): Promise<DbUser | null> {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).maybeSingle();
    if (error) throwDb(error, 'getUserByEmail');
    return data as DbUser | null;
  },

  async upsertUserFromAuth(input: {
    id: string;
    email: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<DbUser> {
    const existing = await this.getUserById(input.id);
    if (existing) {
      const granted = await grantTestingTrial(input.id, input.email);
      return granted ?? existing;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: input.id,
        email: input.email,
        role: input.role ?? (input.email.endsWith('@hexcloud.com') ? 'ADMIN' : 'USER'),
        plan_type: 'FREE',
        wallet_balance: 0,
        status: 'ACTIVE',
      })
      .select()
      .single();
    if (error) throwDb(error, 'upsertUserFromAuth');
    const granted = await grantTestingTrial(input.id, input.email);
    return granted ?? (data as DbUser);
  },

  async listUsersForAdmin() {
    const { data: users, error } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
    if (error) throwDb(error, 'listUsersForAdmin');
    const { data: vps } = await supabaseAdmin.from('vps_instances').select('user_id');
    const { data: gpu } = await supabaseAdmin.from('gpu_sessions').select('user_id');
    return (users ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      planType: u.plan_type,
      walletBalance: Number(u.wallet_balance),
      status: u.status ?? 'ACTIVE',
      createdAt: u.created_at,
      _count: {
        vpsInstances: (vps ?? []).filter((v) => v.user_id === u.id).length,
        gpuSessions: (gpu ?? []).filter((g) => g.user_id === u.id).length,
      },
    }));
  },

  async suspendUser(id: string) {
    await supabaseAdmin.from('users').update({ status: 'SUSPENDED' }).eq('id', id);
    const { data: vpsList } = await supabaseAdmin.from('vps_instances').select('id').eq('user_id', id);
    for (const v of vpsList ?? []) {
      await supabaseAdmin.from('vps_instances').update({ status: 'STOPPED', is_suspended: true }).eq('id', v.id);
    }
  },

  async listAllVps() {
    const { data, error } = await supabaseAdmin
      .from('vps_instances')
      .select('*, user:users!vps_instances_user_id_fkey(email)')
      .order('created_at', { ascending: false });
    if (error) {
      const { data: flat, error: e2 } = await supabaseAdmin.from('vps_instances').select('*').order('created_at', { ascending: false });
      if (e2) throwDb(e2, 'listAllVps');
      const { data: users } = await supabaseAdmin.from('users').select('id, email');
      return (flat ?? []).map((v) => {
        const owner = (users ?? []).find((u) => u.id === v.user_id);
        return { ...v, user: { email: owner?.email ?? 'Unknown' } };
      });
    }
    return data ?? [];
  },

  async listUserVps(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('vps_instances')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throwDb(error, 'listUserVps');
    return data ?? [];
  },

  async getVpsById(id: string) {
    const { data, error } = await supabaseAdmin.from('vps_instances').select('*').eq('id', id).maybeSingle();
    if (error) throwDb(error, 'getVpsById');
    return data;
  },

  async findUserVps(userId: string, vpsId: string) {
    const v = await this.getVpsById(vpsId);
    if (!v || v.user_id !== userId) return null;
    return v;
  },

  async createVps(row: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('vps_instances').insert(row).select().single();
    if (error) throwDb(error, 'createVps');
    return data;
  },

  async updateVps(id: string, patch: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('vps_instances').update(patch).eq('id', id).select().single();
    if (error) throwDb(error, 'updateVps');
    return data;
  },

  async deleteVps(id: string) {
    const { error } = await supabaseAdmin.from('vps_instances').delete().eq('id', id);
    if (error) throwDb(error, 'deleteVps');
  },

  async listGpuSessions() {
    const { data, error } = await supabaseAdmin.from('gpu_sessions').select('*').order('created_at', { ascending: false });
    if (error) throwDb(error, 'listGpuSessions');
    const { data: users } = await supabaseAdmin.from('users').select('id, email');
    return (data ?? []).map((s) => ({
      ...s,
      user: { email: (users ?? []).find((u) => u.id === s.user_id)?.email ?? 'Unknown' },
    }));
  },

  async getGpuSession(id: string) {
    const { data, error } = await supabaseAdmin.from('gpu_sessions').select('*').eq('id', id).maybeSingle();
    if (error) throwDb(error, 'getGpuSession');
    return data;
  },

  async getActiveGpuSessionForUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('gpu_sessions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['ACTIVE', 'QUEUED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throwDb(error, 'getActiveGpuSessionForUser');
    return data;
  },

  async countGpuSessions(where: Record<string, unknown>) {
    let q = supabaseAdmin.from('gpu_sessions').select('*', { count: 'exact', head: true });
    Object.entries(where).forEach(([k, v]) => {
      q = q.eq(k, v);
    });
    const { count, error } = await q;
    if (error) throwDb(error, 'countGpuSessions');
    return count ?? 0;
  },

  async createGpuSession(row: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('gpu_sessions').insert(row).select().single();
    if (error) throwDb(error, 'createGpuSession');
    return data;
  },

  async updateGpuSession(id: string, patch: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.from('gpu_sessions').update(patch).eq('id', id).select().single();
    if (error) throwDb(error, 'updateGpuSession');
    return data;
  },

  async listActiveGpuSessions() {
    const { data, error } = await supabaseAdmin.from('gpu_sessions').select('*').eq('status', 'ACTIVE');
    if (error) throwDb(error, 'listActiveGpuSessions');
    return data ?? [];
  },

  async listQueuedGpuSessions(limit: number) {
    const { data, error } = await supabaseAdmin
      .from('gpu_sessions')
      .select('*')
      .eq('status', 'QUEUED')
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throwDb(error, 'listQueuedGpuSessions');
    return data ?? [];
  },

  async countQueuedBefore(createdAt: string) {
    const { count, error } = await supabaseAdmin
      .from('gpu_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'QUEUED')
      .lt('created_at', createdAt);
    if (error) throwDb(error, 'countQueuedBefore');
    return count ?? 0;
  },

  async debitUserWallet(userId: string, amount: number, description: string) {
    const user = await this.getUserById(userId);
    if (!user) return;
    const newBalance = Math.max(0, Number(user.wallet_balance) - amount);
    await supabaseAdmin.from('users').update({ wallet_balance: newBalance }).eq('id', userId);
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      amount,
      type: 'DEBIT',
      description,
    });
  },

  async creditUserWallet(userId: string, amount: number, description: string) {
    const user = await this.getUserById(userId);
    if (!user) return;
    const newBalance = Number(user.wallet_balance) + amount;
    await supabaseAdmin.from('users').update({ wallet_balance: newBalance }).eq('id', userId);
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      amount,
      type: 'CREDIT',
      description,
    });
    await supabaseAdmin.from('invoices').insert({
      user_id: userId,
      amount,
      status: 'PAID',
      provider: 'INTERNAL',
    });
  },

  async updateUserPlan(userId: string, planType: string) {
    await supabaseAdmin.from('users').update({ plan_type: planType }).eq('id', userId);
  },

  async listTransactions(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throwDb(error, 'listTransactions');
    return data ?? [];
  },

  async listInvoices(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throwDb(error, 'listInvoices');
    return data ?? [];
  },

  async insertLog(level: string, message: string, service: string) {
    await supabaseAdmin.from('system_logs').insert({ level, message, service });
  },

  async listLogs(limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throwDb(error, 'listLogs');
    return data ?? [];
  },

  async getBillingOverview() {
    const { data: invoices } = await supabaseAdmin.from('invoices').select('amount, status, created_at');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const paid = (invoices ?? []).filter((i) => i.status === 'PAID');
    const totalRevenue = paid.reduce((s, i) => s + Number(i.amount), 0);
    const monthlyRevenue = paid
      .filter((i) => new Date(i.created_at) >= monthStart)
      .reduce((s, i) => s + Number(i.amount), 0);
    const unpaidInvoices = (invoices ?? []).filter((i) => i.status === 'UNPAID' || i.status === 'PENDING').length;
    const { data: subs } = await supabaseAdmin.from('subscriptions').select('id').eq('status', 'ACTIVE');
    const { count: txCount } = await supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true });
    return {
      totalRevenue,
      monthlyRevenue,
      unpaidInvoices,
      activeSubscriptions: subs?.length ?? 0,
      transactionCount: txCount ?? 0,
    };
  },

  async listTickets() {
    const { data, error } = await supabaseAdmin.from('support_tickets').select('*').order('updated_at', { ascending: false });
    if (error) throwDb(error, 'listTickets');
    const { data: users } = await supabaseAdmin.from('users').select('id, email');
    return (data ?? []).map((t) => ({
      ...t,
      userEmail: (users ?? []).find((u) => u.id === t.user_id)?.email,
    }));
  },

  async updateTicket(id: string, patch: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throwDb(error, 'updateTicket');
    return data;
  },

  async listComputeNodes() {
    const { data, error } = await supabaseAdmin.from('compute_nodes').select('*').order('name');
    if (error) throwDb(error, 'listComputeNodes');
    return data ?? [];
  },

  async updateComputeNode(id: string, status: string) {
    const { data, error } = await supabaseAdmin.from('compute_nodes').update({ status }).eq('id', id).select().single();
    if (error) throwDb(error, 'updateComputeNode');
    return data;
  },
};

/** Map API / DB VPS row to camelCase JSON for frontend */
export function mapVpsRow(v: Record<string, unknown>) {
  return {
    id: v.id,
    userId: v.user_id,
    name: v.name,
    status: v.status,
    ipAddress: v.ip_address,
    osType: v.os_type,
    cpu: v.cpu,
    ram: v.ram,
    storage: v.storage,
    isSuspended: Boolean(v.is_suspended),
    createdAt: v.created_at,
    user: v.user as { email: string } | undefined,
  };
}

export function mapGpuRow(s: Record<string, unknown>) {
  return {
    id: s.id,
    userId: s.user_id,
    gpuType: s.gpu_type,
    status: s.status,
    startTime: s.start_time,
    endTime: s.end_time,
    createdAt: s.created_at,
    user: s.user as { email: string } | undefined,
  };
}
