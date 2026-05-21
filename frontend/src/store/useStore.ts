import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { api, isApiError } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { createRazorpayOrder, openRazorpayCheckout } from '../lib/payments';
import {
  buildUsageTimeSeries,
  calcProration,
  PLAN_SPECS,
  USD_TO_INR,
  type UsageTimeSeries,
  type PlanType,
} from '../lib/billingUtils';
import type {
  Subscription,
  UsageRecord,
  PaymentMethod,
  SupportTicket,
  ComputeNode,
  BillingOverview,
} from '../types/billing';
import type { TrialRequest, AdminTrialRequest } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  planType: 'FREE' | 'BASIC' | 'PRO';
  walletBalance: number;
  trialActive?: boolean;
  trialExpiresAt?: string | null;
  trialMsRemaining?: number;
  createdAt: string;
}

interface VpsInstance {
  id: string;
  name: string;
  status: 'PROVISIONING' | 'RUNNING' | 'STOPPED' | 'ERROR';
  ipAddress: string;
  osType: string;
  cpu: number;
  ram: number;
  storage: number;
  createdAt: string;
}

interface GpuSession {
  id: string;
  userId: string;
  gpuType: string;
  status: 'QUEUED' | 'ACTIVE' | 'ENDED';
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

interface QueueInfo {
  session: GpuSession;
  queuePosition: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  provider?: string | null;
  invoiceNumber?: string | null;
  createdAt: string;
}

interface SystemLog {
  id: string;
  level: string;
  message: string;
  service: string;
  createdAt: string;
}

interface AdminUser extends User {
  status?: 'ACTIVE' | 'SUSPENDED';
  _count: {
    vpsInstances: number;
    gpuSessions: number;
  };
}

interface AdminVps extends VpsInstance {
  user: { email: string };
  isSuspended?: boolean;
}

interface AdminSession extends GpuSession {
  user: { email: string };
}

interface StoreState {
  token: string | null;
  user: User | null;
  vpsList: VpsInstance[];
  activeSession: QueueInfo | null;
  transactions: Transaction[];
  invoices: Invoice[];
  subscription: Subscription | null;
  usageRecords: UsageRecord[];
  usageMetrics: UsageTimeSeries | null;
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  
  // Admin fields
  adminUsers: AdminUser[];
  adminVpsList: AdminVps[];
  adminSessions: AdminSession[];
  adminLogs: SystemLog[];
  adminTickets: SupportTicket[];
  computeNodes: ComputeNode[];
  billingOverview: BillingOverview | null;
  adminTrialRequests: AdminTrialRequest[];

  // Trial request fields (user-facing)
  myTrialRequests: TrialRequest[];

  // Actions
  init: () => void;
  setError: (error: string | null) => void;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
  
  // VPS Actions
  fetchVps: () => Promise<void>;
  createVps: (data: { name: string; osType: string; tierId: string; storage: number }) => Promise<void>;
  startVps: (id: string) => Promise<void>;
  stopVps: (id: string) => Promise<void>;
  deleteVps: (id: string) => Promise<void>;

  // Cloud PC Actions
  fetchSessionStatus: () => Promise<void>;
  startSession: (gpuType: string) => Promise<void>;
  endSession: (id: string) => Promise<void>;

  // Billing Actions
  fetchBillingData: () => Promise<void>;
  subscribeWithRazorpay: (planType: 'BASIC' | 'PRO', amountInrOverride?: number) => Promise<void>;
  upgradePlanOneClick: (planType: 'BASIC' | 'PRO') => Promise<void>;
  changePlan: (planType: 'FREE' | 'BASIC' | 'PRO') => Promise<void>;
  resizeVpsForPlan: (planType: PlanType) => Promise<void>;
  createBillingSupportTicket: (subject: string, message: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  addPaymentMethod: (data: { brand: string; last4: string; expMonth?: number; expYear?: number }) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  recordUsage: (resourceType: UsageRecord['resourceType'], label: string, cost: number, unit?: string) => Promise<void>;

  // Admin Actions
  fetchAdminData: () => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  stopVpsAdmin: (id: string) => Promise<void>;
  suspendVpsAdmin: (id: string) => Promise<void>;
  stopSessionAdmin: (id: string) => Promise<void>;
  updateNodeStatus: (id: string, status: ComputeNode['status']) => Promise<void>;
  updateTicket: (id: string, updates: { status?: SupportTicket['status']; priority?: SupportTicket['priority']; adminNotes?: string }) => Promise<void>;
  fetchAdminTrialRequests: () => Promise<void>;
  approveTrialRequest: (id: string, adminNote?: string) => Promise<void>;
  rejectTrialRequest: (id: string, adminNote?: string) => Promise<void>;

  // Trial Request Actions (user-facing)
  submitTrialRequest: (data: { fullName: string; purpose: string; osPreference: string; comments?: string }) => Promise<void>;
  fetchMyTrialRequests: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => {
  return {
    token: null,
    user: null,
    vpsList: [],
    activeSession: null,
    transactions: [],
    invoices: [],
    subscription: null,
    usageRecords: [],
    usageMetrics: null,
    paymentMethods: [],
    isLoading: false,
    error: null,
    adminUsers: [],
    adminVpsList: [],
    adminSessions: [],
    adminLogs: [],
    adminTickets: [],
    computeNodes: [],
    billingOverview: null,
    adminTrialRequests: [],
    myTrialRequests: [],

    init: () => {
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.access_token) {
          set({ token: session.access_token });
          await get().fetchProfile();
          await get().fetchVps();
          await get().fetchSessionStatus();
          await get().fetchMyTrialRequests();

          const sock = connectSocket(session.user.id);
          sock.off('vps_status_update');
          sock.off('vps_deleted');
          sock.off('session_active');
          sock.off('session_ended');
          sock.off('system_log');
          sock.on('vps_status_update', (row: Record<string, unknown>) => {
            const mapped: VpsInstance = {
              id: row.id as string,
              name: row.name as string,
              status: row.status as VpsInstance['status'],
              ipAddress: (row.ipAddress ?? row.ip_address) as string,
              osType: (row.osType ?? row.os_type) as string,
              cpu: row.cpu as number,
              ram: row.ram as number,
              storage: row.storage as number,
              createdAt: (row.createdAt ?? row.created_at) as string,
            };
            set((state) => ({
              vpsList: state.vpsList.some((v) => v.id === mapped.id)
                ? state.vpsList.map((v) => (v.id === mapped.id ? mapped : v))
                : [mapped, ...state.vpsList],
            }));
          });
          sock.on('vps_deleted', ({ id }: { id: string }) => {
            set((state) => ({ vpsList: state.vpsList.filter((v) => v.id !== id) }));
          });
          sock.on('session_active', () => get().fetchSessionStatus());
          sock.on('session_ended', () => {
            get().fetchSessionStatus();
            get().fetchProfile();
          });
          sock.on('system_log', (log: Record<string, unknown>) => {
            set((state) => ({
              adminLogs: [
                {
                  id: (log.id as string) || crypto.randomUUID(),
                  level: log.level as string,
                  message: log.message as string,
                  service: log.service as string,
                  createdAt: (log.createdAt ?? log.created_at ?? new Date().toISOString()) as string,
                },
                ...state.adminLogs.slice(0, 99),
              ],
            }));
          });

          if (get().user?.role === 'ADMIN') {
            await get().fetchAdminData();
          }
        } else {
          disconnectSocket();
          set({ token: null, user: null, vpsList: [], activeSession: null });
        }
      });
    },

    setError: (error) => set({ error }),

    fetchProfile: async () => {
      const token = get().token;
      if (!token) return;
      try {
        const profile = await api.auth.profile(token);
        set({
          user: {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            planType: profile.planType as User['planType'],
            walletBalance: profile.walletBalance,
            trialActive: profile.trialActive,
            trialExpiresAt: profile.trialExpiresAt,
            trialMsRemaining: profile.trialMsRemaining,
            createdAt: profile.createdAt,
          },
        });
      } catch (err) {
        console.error('Error fetching profile', err);
        if (isApiError(err)) set({ error: err.message });
      }
    },

    logout: async () => {
      disconnectSocket();
      await supabase.auth.signOut();
      set({ token: null, user: null, vpsList: [], activeSession: null });
    },

    fetchVps: async () => {
      const token = get().token;
      if (!token) return;
      set({ isLoading: true, error: null });
      try {
        const data = await api.vps.list(token);
        set({
          vpsList: data.map((d) => ({
            id: d.id,
            name: d.name,
            status: d.status as VpsInstance['status'],
            ipAddress: d.ipAddress,
            osType: d.osType,
            cpu: d.cpu,
            ram: d.ram,
            storage: d.storage,
            createdAt: d.createdAt,
          })),
        });
      } catch (err: unknown) {
        set({ error: isApiError(err) ? err.message : 'Failed to fetch VPS instances' });
      } finally {
        set({ isLoading: false });
      }
    },

    createVps: async (vpsData) => {
      const token = get().token;
      if (!token) return;
      set({ isLoading: true, error: null });
      try {
        await api.vps.create(token, vpsData);
        await get().fetchVps();
      } catch (err: unknown) {
        set({ error: isApiError(err) ? err.message : 'Failed to create VPS' });
      } finally {
        set({ isLoading: false });
      }
    },

    startVps: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.vps.start(token, id);
        await get().fetchVps();
      } catch (e) {
        console.error(e);
      }
    },

    stopVps: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.vps.stop(token, id);
        await get().fetchVps();
      } catch (e) {
        console.error(e);
      }
    },

    deleteVps: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.vps.delete(token, id);
        await get().fetchVps();
      } catch (e) {
        console.error(e);
      }
    },

    fetchSessionStatus: async () => {
      const token = get().token;
      if (!token) return;
      try {
        const data = await api.cloudPc.status(token);
        if (!data) {
          set({ activeSession: null });
          return;
        }
        set({
          activeSession: {
            session: {
              id: data.session.id,
              userId: data.session.userId,
              gpuType: data.session.gpuType,
              status: data.session.status as GpuSession['status'],
              startTime: data.session.startTime,
              endTime: data.session.endTime,
              createdAt: data.session.createdAt,
            },
            queuePosition: data.queuePosition,
          },
        });
      } catch (e) {
        console.error(e);
      }
    },

    startSession: async (gpuType) => {
      const token = get().token;
      if (!token) return;
      set({ isLoading: true, error: null });
      try {
        await api.cloudPc.start(token, gpuType);
        await get().fetchSessionStatus();
      } catch (err: unknown) {
        set({ error: isApiError(err) ? err.message : 'Failed to start session' });
      } finally {
        set({ isLoading: false });
      }
    },

    endSession: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.cloudPc.end(token, id);
        set({ activeSession: null });
        await get().fetchProfile();
      } catch (e) {
        console.error(e);
      }
    },

    fetchBillingData: async () => {
      const token = get().token;
      const { user } = get();
      if (!token || !user) return;
      try {
        const summary = await api.billing.summary(token);
        set({
          transactions: summary.transactions.map((t) => ({
            ...t,
            type: t.type as 'CREDIT' | 'DEBIT',
          })),
          invoices: summary.invoices,
        });
        if (summary.subscription) {
          const s = summary.subscription;
          set({
            subscription: {
              id: s.id as string,
              planType: s.planType as Subscription['planType'],
              status: s.status as Subscription['status'],
              billingCycle: s.billingCycle as Subscription['billingCycle'],
              amount: Number(s.amount),
              provider: s.provider as Subscription['provider'],
              currentPeriodStart: s.currentPeriodStart as string,
              currentPeriodEnd: (s.currentPeriodEnd as string) ?? null,
            },
          });
        } else {
          set({
            subscription: {
              id: 'local',
              planType: user.planType,
              status: 'ACTIVE',
              billingCycle: 'MONTHLY',
              amount: user.planType === 'PRO' ? 25 : user.planType === 'BASIC' ? 10 : 0,
              provider: 'INTERNAL',
              currentPeriodStart: user.createdAt,
              currentPeriodEnd: null,
            },
          });
        }
        set({
          usageRecords: summary.usageRecords.map((u) => ({
            id: u.id as string,
            resourceType: u.resourceType as UsageRecord['resourceType'],
            resourceLabel: u.resourceLabel as string,
            quantity: Number(u.quantity),
            unit: u.unit as string,
            cost: Number(u.cost),
            periodStart: u.periodStart as string,
            periodEnd: (u.periodEnd as string) ?? null,
            createdAt: u.createdAt as string,
          })),
          paymentMethods: summary.paymentMethods.map((p) => ({
            id: p.id as string,
            provider: p.provider as PaymentMethod['provider'],
            brand: p.brand as string,
            last4: p.last4 as string,
            expMonth: (p.expMonth as number) ?? null,
            expYear: (p.expYear as number) ?? null,
            isDefault: Boolean(p.isDefault),
          })),
        });
        await get().fetchVps();
        const { vpsList, usageRecords: records } = get();
        const totalCpu = vpsList.reduce((s, v) => s + v.cpu, 0);
        const totalRam = vpsList.reduce((s, v) => s + v.ram, 0);
        set({ usageMetrics: buildUsageTimeSeries(vpsList.length, totalCpu, totalRam, records) });
      } catch (e) {
        console.error(e);
      }
    },

    recordUsage: async (resourceType, label, cost, unit = 'hours') => {
      const { user } = get();
      if (!user || cost <= 0) return;
      try {
        await supabase.from('usage_records').insert({
          user_id: user.id,
          resource_type: resourceType,
          resource_label: label,
          quantity: 1,
          unit,
          cost,
          period_start: new Date().toISOString(),
        });
      } catch {
        /* table may not exist until migration runs */
      }
    },

    resizeVpsForPlan: async (planType) => {
      const specs = PLAN_SPECS[planType];
      const { vpsList } = get();
      try {
        for (const vps of vpsList) {
          await supabase
            .from('vps_instances')
            .update({ cpu: specs.cpu, ram: specs.ram, storage: Math.max(vps.storage, specs.storage) })
            .eq('id', vps.id);
        }
        await get().fetchVps();
        await supabase.from('system_logs').insert({
          level: 'INFO',
          message: `Instant VPS resize applied for plan ${planType} (${vpsList.length} instances)`,
          service: 'BILLING',
        });
      } catch (e) {
        console.error(e);
      }
    },

    subscribeWithRazorpay: async (planType, amountInrOverride) => {
      const { user } = get();
      if (!user) return;
      const prices = { BASIC: 10, PRO: 25 };
      const costUsd = amountInrOverride
        ? amountInrOverride / USD_TO_INR
        : prices[planType];
      set({ isLoading: true, error: null });
      try {
        const order = await createRazorpayOrder(costUsd);
        await openRazorpayCheckout(order.orderId!, order.amount, user.email, async () => {
          const t = get().token;
          if (!t) return;
          const amountInr = amountInrOverride ?? prices[planType] * USD_TO_INR;
          await api.billing.checkoutMock(t, order.orderId!, amountInr);
          await get().changePlan(planType);
        });
      } catch (err: unknown) {
        set({ error: err instanceof Error ? err.message : 'Razorpay payment failed' });
      } finally {
        set({ isLoading: false });
      }
    },

    upgradePlanOneClick: async (planType) => {
      const { user, subscription } = get();
      if (!user) return;
      const current = (subscription?.planType ?? user.planType) as PlanType;
      const quote = calcProration(current, planType, subscription?.currentPeriodEnd ?? null);
      await get().subscribeWithRazorpay(planType, quote.totalInr);
    },

    createBillingSupportTicket: async (subject, message) => {
      const { user } = get();
      if (!user) return;
      set({ isLoading: true, error: null });
      try {
        await supabase.from('support_tickets').insert({
          user_id: user.id,
          subject,
          message,
          priority: 'HIGH',
          status: 'OPEN',
        });
        await supabase.from('system_logs').insert({
          level: 'INFO',
          message: `Billing ticket from ${user.email}: ${subject}`,
          service: 'BILLING',
        });
      } catch (err: unknown) {
        set({ error: err instanceof Error ? err.message : 'Could not create ticket' });
        throw err;
      } finally {
        set({ isLoading: false });
      }
    },

    changePlan: async (planType) => {
      const { token } = get();
      if (!token) return;
      set({ isLoading: true, error: null });
      try {
        await api.billing.changePlan(token, planType);
        await get().resizeVpsForPlan(planType);
        await get().fetchProfile();
        await get().fetchBillingData();
      } catch (err: unknown) {
        set({ error: isApiError(err) ? err.message : 'Failed to switch plans' });
      } finally {
        set({ isLoading: false });
      }
    },

    cancelSubscription: async () => {
      const { user, subscription } = get();
      if (!user) return;
      set({ isLoading: true, error: null });
      try {
        if (subscription?.id && subscription.id !== 'local') {
          await supabase.from('subscriptions').update({ status: 'CANCELLED' }).eq('id', subscription.id);
        }
        await supabase.from('users').update({ plan_type: 'FREE' }).eq('id', user.id);
        await supabase.from('system_logs').insert({
          level: 'INFO',
          message: `User ${user.email} cancelled subscription`,
          service: 'BILLING',
        });
        await get().fetchProfile();
        await get().fetchBillingData();
      } catch (err: unknown) {
        set({ error: err instanceof Error ? err.message : 'Failed to cancel subscription' });
      } finally {
        set({ isLoading: false });
      }
    },

    addPaymentMethod: async ({ brand, last4, expMonth, expYear }) => {
      const { user, paymentMethods } = get();
      if (!user) return;
      set({ isLoading: true, error: null });
      try {
        await supabase.from('payment_methods').insert({
          user_id: user.id,
          provider: 'RAZORPAY',
          brand,
          last4,
          exp_month: expMonth ?? null,
          exp_year: expYear ?? null,
          is_default: paymentMethods.length === 0,
          external_id: `rzp_pm_${Date.now()}`,
        });
        await get().fetchBillingData();
      } catch (err: unknown) {
        set({ error: err instanceof Error ? err.message : 'Failed to save payment method' });
      } finally {
        set({ isLoading: false });
      }
    },

    removePaymentMethod: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await supabase.from('payment_methods').delete().eq('id', id);
        await get().fetchBillingData();
      } catch (err: unknown) {
        set({ error: err instanceof Error ? err.message : 'Failed to remove payment method' });
      } finally {
        set({ isLoading: false });
      }
    },

    setDefaultPaymentMethod: async (id) => {
      const { user } = get();
      if (!user) return;
      try {
        await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', user.id);
        await supabase.from('payment_methods').update({ is_default: true }).eq('id', id);
        await get().fetchBillingData();
      } catch (e) {
        console.error(e);
      }
    },

    fetchAdminData: async () => {
      const token = get().token;
      if (!token) return;
      try {
        const o = await api.admin.overview(token);
        set({
          adminUsers: o.users.map((u) => ({
            id: u.id,
            email: u.email,
            role: u.role as AdminUser['role'],
            planType: u.planType as AdminUser['planType'],
            walletBalance: u.walletBalance,
            status: (u.status as AdminUser['status']) ?? 'ACTIVE',
            createdAt: u.createdAt,
            _count: u._count,
          })),
          adminVpsList: o.vps.map((v) => ({
            id: v.id,
            name: v.name,
            status: v.status as AdminVps['status'],
            ipAddress: v.ipAddress,
            osType: v.osType,
            cpu: v.cpu,
            ram: v.ram,
            storage: v.storage,
            createdAt: v.createdAt,
            isSuspended: Boolean(v.isSuspended),
            user: { email: v.user?.email ?? 'Unknown' },
          })),
          adminSessions: o.sessions.map((s) => ({
            id: s.id,
            userId: s.userId,
            gpuType: s.gpuType,
            status: s.status as GpuSession['status'],
            startTime: s.startTime,
            endTime: s.endTime,
            createdAt: s.createdAt,
            user: { email: s.user?.email ?? 'Unknown' },
          })),
          adminLogs: o.logs,
          adminTickets: o.tickets.map((t) => ({
            id: t.id as string,
            userId: t.userId as string,
            userEmail: t.userEmail as string | undefined,
            subject: t.subject as string,
            message: t.message as string,
            status: t.status as SupportTicket['status'],
            priority: t.priority as SupportTicket['priority'],
            adminNotes: (t.adminNotes as string) ?? null,
            createdAt: t.createdAt as string,
            updatedAt: t.updatedAt as string,
          })),
          computeNodes: o.computeNodes.map((n) => ({
            ...n,
            status: n.status as ComputeNode['status'],
          })),
          billingOverview: o.billingOverview,
        });
      } catch (e) {
        console.error(e);
      }
    },

    suspendUser: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.suspendUser(token, id);
        await get().fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    },

    stopVpsAdmin: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.stopVps(token, id);
        await get().fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    },

    suspendVpsAdmin: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.suspendVps(token, id);
        await get().fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    },

    updateNodeStatus: async (id, status) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.updateNode(token, id, status);
        await get().fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    },

    updateTicket: async (id, updates) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.updateTicket(token, id, updates as Record<string, unknown>);
        await get().fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    },

    stopSessionAdmin: async (id) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.stopSession(token, id);
        await get().fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    },

    // ── Trial Request Actions (user-facing) ──────────────────────────────
    submitTrialRequest: async (data) => {
      const token = get().token;
      if (!token) return;
      set({ isLoading: true, error: null });
      try {
        await api.trial.submitRequest(token, data);
        await get().fetchMyTrialRequests();
      } catch (err: unknown) {
        set({ error: isApiError(err) ? err.message : 'Failed to submit trial request' });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchMyTrialRequests: async () => {
      const token = get().token;
      if (!token) return;
      try {
        const requests = await api.trial.getMyRequests(token);
        set({ myTrialRequests: requests });
      } catch (e) {
        console.error(e);
      }
    },

    // ── Admin Trial Request Actions ─────────────────────────────────────
    fetchAdminTrialRequests: async () => {
      const token = get().token;
      if (!token) return;
      try {
        const requests = await api.admin.listTrialRequests(token);
        set({ adminTrialRequests: requests });
      } catch (e) {
        console.error(e);
      }
    },

    approveTrialRequest: async (id, adminNote) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.approveTrialRequest(token, id, adminNote);
        await get().fetchAdminTrialRequests();
      } catch (e) {
        console.error(e);
      }
    },

    rejectTrialRequest: async (id, adminNote) => {
      const token = get().token;
      if (!token) return;
      try {
        await api.admin.rejectTrialRequest(token, id, adminNote);
        await get().fetchAdminTrialRequests();
      } catch (e) {
        console.error(e);
      }
    }
  };
});
