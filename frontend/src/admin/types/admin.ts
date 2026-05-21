export type AdminRole = 'ADMIN' | 'SUPPORT' | 'USER';
export type VpsStatus = 'PROVISIONING' | 'RUNNING' | 'STOPPED' | 'ERROR' | 'SUSPENDED';
export type RegionId = 'mumbai' | 'singapore' | 'frankfurt' | 'virginia' | 'tokyo';
export type PaymentStatus = 'paid' | 'unpaid' | 'overdue' | 'pending';
export type LogCategory = 'system' | 'vps' | 'auth' | 'billing';

export interface AdminRegion {
  id: RegionId;
  label: string;
  flag: string;
  latencyMs: number;
}

export interface AdminVpsRow {
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  region: RegionId;
  os: string;
  status: VpsStatus;
  cpu: number;
  ramGb: number;
  storageGb: number;
  cpuUsage: number;
  ramUsage: number;
  ip: string;
  hasGpu: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  plan: string;
  balance: number;
  credits: number;
  vpsCount: number;
  gpuCount: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';
  lastLogin: string;
  referralCode?: string;
}

export interface AdminInvoice {
  id: string;
  number: string;
  userEmail: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  createdAt: string;
  provider: string;
}

export interface AdminPlan {
  id: string;
  name: string;
  priceMonthly: number;
  vcpu: number;
  ramGb: number;
  storageGb: number;
  bandwidthTb: number;
  gpuIncluded: boolean;
  activeUsers: number;
}

export interface MetricPoint {
  t: number;
  v: number;
}

export interface NodeHealth {
  id: string;
  name: string;
  region: RegionId;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  cpu: number;
  ram: number;
  disk: number;
  networkMbps: number;
  vpsHosted: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'critical';
}

export interface VpsCreateForm {
  os: string;
  cpu: number;
  ram: number;
  storage: number;
  region: RegionId;
  gpu: boolean;
  hostname: string;
}
