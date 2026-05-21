/**
 * HEXCloud REST API client — all app data flows through the backend in production.
 * Auth: Supabase session token sent as Bearer JWT.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiError extends Error {
  status: number;
}

export interface TrialVerificationState {
  step: number;
  aadhaarVerified: boolean;
  aadhaarLast4: string | null;
  verificationPaid: boolean;
  trialActive: boolean;
  trialExpired: boolean;
  trialExpiresAt: string | null;
  trialMsRemaining: number;
  trialCreditsInr: number;
  verificationFeeInr: number;
  canStartClaim: boolean;
  demoOtpHint?: string;
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && (err as ApiError).status !== undefined;
}

function createApiError(message: string, status: number): ApiError {
  const err = new Error(message) as ApiError;
  err.name = 'ApiError';
  err.status = status;
  return err;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw createApiError((body as { error?: string }).error || res.statusText, res.status);
  }
  return body as T;
}

export const api = {
  health: () =>
    fetch(`${getApiOrigin()}/health`).then((r) => r.json() as Promise<{ status: string }>),

  auth: {
    profile: (token: string) =>
      request<{
        id: string;
        email: string;
        role: 'USER' | 'ADMIN';
        planType: string;
        walletBalance: number;
        trialActive?: boolean;
        trialExpiresAt?: string | null;
        trialCreditsInr?: number;
        trialMsRemaining?: number;
        trialVerification?: TrialVerificationState;
        createdAt: string;
      }>('/auth/profile', { token }),
  },

  trial: {
    status: (token: string) => request<TrialVerificationState>('/trial/status', { token }),
    sendAadhaarOtp: (token: string, aadhaar: string) =>
      request<{ message: string; maskedAadhaar: string; demoOtp: string }>('/trial/aadhaar/send-otp', {
        method: 'POST',
        token,
        body: JSON.stringify({ aadhaar }),
      }),
    verifyAadhaarOtp: (token: string, otp: string) =>
      request<{ message: string }>('/trial/aadhaar/verify-otp', {
        method: 'POST',
        token,
        body: JSON.stringify({ otp }),
      }),
    createVerificationPayment: (token: string) =>
      request<{ orderId: string; amount: number; currency: string }>('/trial/verification-payment', {
        method: 'POST',
        token,
      }),
    complete: (token: string, body: { orderId: string; paymentId?: string }) =>
      request<{ message: string } & TrialVerificationState>('/trial/complete', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      }),
  },

  vps: {
    plans: (token: string) =>
      request<VpsPlansResponse>('/vps/plans', { token }),
    list: (token: string) => request<VpsApiRow[]>('/vps/user', { token }),
    create: (token: string, data: VpsCreatePayload) =>
      request<VpsApiRow>('/vps/create', { method: 'POST', token, body: JSON.stringify(data) }),
    start: (token: string, id: string) =>
      request<VpsApiRow>(`/vps/start/${id}`, { method: 'POST', token }),
    stop: (token: string, id: string) =>
      request<VpsApiRow>(`/vps/stop/${id}`, { method: 'POST', token }),
    delete: (token: string, id: string) =>
      request<{ message: string }>(`/vps/${id}`, { method: 'DELETE', token }),
    get: (token: string, id: string) => request<VpsApiRow>(`/vps/${id}`, { token }),
    startBody: (token: string, id: string) =>
      request<VpsApiRow>('/vps/start', { method: 'POST', token, body: JSON.stringify({ id }) }),
    stopBody: (token: string, id: string) =>
      request<VpsApiRow>('/vps/stop', { method: 'POST', token, body: JSON.stringify({ id }) }),
    restart: (token: string, id: string) =>
      request<VpsApiRow>('/vps/restart', { method: 'POST', token, body: JSON.stringify({ id }) }),
    stats: (token: string, id: string) =>
      request<Record<string, unknown>>(`/vps/stats?id=${encodeURIComponent(id)}`, { token }),
  },

  cloudPc: {
    status: (token: string) =>
      request<{
        session: {
          id: string;
          userId: string;
          gpuType: string;
          status: string;
          startTime: string | null;
          endTime: string | null;
          createdAt: string;
        };
        queuePosition: number;
      } | null>('/cloudpc/session/status', { token }),
    start: (token: string, gpuType: string) =>
      request('/cloudpc/session/start', {
        method: 'POST',
        token,
        body: JSON.stringify({ gpuType }),
      }),
    end: (token: string, id: string) =>
      request(`/cloudpc/session/end/${id}`, { method: 'POST', token }),
  },

  billing: {
    summary: (token: string) => request<BillingSummaryResponse>('/billing/summary', { token }),
    changePlan: (token: string, planType: string) =>
      request('/billing/change-plan', {
        method: 'POST',
        token,
        body: JSON.stringify({ planType }),
      }),
    checkoutMock: (token: string, sessionId: string, amount: number) =>
      request('/billing/checkout/complete-mock', {
        method: 'POST',
        token,
        body: JSON.stringify({ sessionId, amount }),
      }),
    stripeCheckout: (token: string, amount: number) =>
      request<{ url: string; sessionId: string }>('/billing/stripe/checkout', {
        method: 'POST',
        token,
        body: JSON.stringify({ amount }),
      }),
    razorpayOrder: (token: string, amount: number) =>
      request<{ orderId: string; amount: number }>('/billing/razorpay/order', {
        method: 'POST',
        token,
        body: JSON.stringify({ amount }),
      }),
  },

  admin: {
    overview: (token: string) => request<AdminOverviewResponse>('/admin/overview', { token }),
    suspendUser: (token: string, id: string) =>
      request(`/admin/users/${id}/suspend`, { method: 'POST', token }),
    stopVps: (token: string, id: string) =>
      request(`/admin/vps/stop/${id}`, { method: 'POST', token }),
    suspendVps: (token: string, id: string) =>
      request(`/admin/vps/suspend/${id}`, { method: 'POST', token }),
    stopSession: (token: string, id: string) =>
      request(`/admin/sessions/stop/${id}`, { method: 'POST', token }),
    updateTicket: (token: string, id: string, updates: Record<string, unknown>) =>
      request(`/admin/tickets/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(updates),
      }),
    updateNode: (token: string, id: string, status: string) =>
      request(`/admin/nodes/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      }),
  },
};

export interface VpsCreatePayload {
  name: string;
  osType: string;
  tierId: string;
  storage: number;
}

export interface VpsPlansResponse {
  currency: 'INR';
  maxCpu: number;
  maxRamMb: number;
  tiers: {
    id: string;
    label: string;
    cpu: number;
    ramMb: number;
    ramGb: number;
    priceInr: number;
    priceLabel: string;
  }[];
}

export interface VpsApiRow {
  id: string;
  userId?: string;
  name: string;
  status: string;
  ipAddress: string;
  osType: string;
  cpu: number;
  ram: number;
  storage: number;
  isSuspended?: boolean;
  createdAt: string;
  user?: { email: string };
}

export interface BillingSummaryResponse {
  transactions: { id: string; amount: number; type: string; description: string; createdAt: string }[];
  invoices: { id: string; amount: number; status: string; createdAt: string; provider?: string }[];
  subscription: Record<string, unknown> | null;
  usageRecords: Record<string, unknown>[];
  paymentMethods: Record<string, unknown>[];
}

export interface AdminOverviewResponse {
  users: {
    id: string;
    email: string;
    role: string;
    planType: string;
    walletBalance: number;
    status: string;
    createdAt: string;
    _count: { vpsInstances: number; gpuSessions: number };
  }[];
  vps: VpsApiRow[];
  sessions: {
    id: string;
    userId: string;
    gpuType: string;
    status: string;
    startTime: string | null;
    endTime: string | null;
    createdAt: string;
    user?: { email: string };
  }[];
  logs: { id: string; level: string; message: string; service: string; createdAt: string }[];
  tickets: Record<string, unknown>[];
  computeNodes: {
    id: string;
    name: string;
    region: string;
    status: string;
    totalCpu: number;
    usedCpu: number;
    totalRamGb: number;
    usedRamGb: number;
    vpsCount: number;
  }[];
  billingOverview: {
    totalRevenue: number;
    monthlyRevenue: number;
    unpaidInvoices: number;
    activeSubscriptions: number;
    transactionCount: number;
  };
}

export function getApiOrigin(): string {
  return API_BASE.replace(/\/api$/, '');
}
