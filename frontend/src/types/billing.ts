export interface Subscription {
  id: string;
  planType: 'FREE' | 'BASIC' | 'PRO';
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  provider: 'STRIPE' | 'RAZORPAY' | 'INTERNAL' | null;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
}

export interface UsageRecord {
  id: string;
  resourceType: 'VPS' | 'GPU' | 'STORAGE' | 'NETWORK';
  resourceLabel: string;
  quantity: number;
  unit: string;
  cost: number;
  periodStart: string;
  periodEnd: string | null;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  provider: 'RAZORPAY';
  brand: string;
  last4: string;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail?: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComputeNode {
  id: string;
  name: string;
  region: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  totalCpu: number;
  usedCpu: number;
  totalRamGb: number;
  usedRamGb: number;
  vpsCount: number;
}

export interface BillingOverview {
  totalRevenue: number;
  monthlyRevenue: number;
  unpaidInvoices: number;
  activeSubscriptions: number;
  transactionCount: number;
}
