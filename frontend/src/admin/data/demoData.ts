import type { AdminInvoice, AdminUserRow, AdminVpsRow, NodeHealth } from '../types/admin';

const OWNERS = [
  'alex@acme.io', 'priya@startup.in', 'dev@hexcloud.test', 'ops@fintech.co',
  'sarah@labs.dev', 'mike@agency.com', 'nina@saas.io', 'team@mlcorp.ai',
];

const REGIONS = ['mumbai', 'singapore', 'frankfurt', 'virginia', 'tokyo'] as const;

export function getDemoVpsRows(count = 12): AdminVpsRow[] {
  return Array.from({ length: count }, (_, i) => {
    const status = i % 7 === 0 ? 'STOPPED' : i % 11 === 0 ? 'SUSPENDED' : 'RUNNING';
    return {
      id: `demo-vps-${i}`,
      name: `hex-vps-${String(i + 1).padStart(3, '0')}`,
      owner: OWNERS[i % OWNERS.length],
      ownerId: `user-${i % 8}`,
      region: REGIONS[i % REGIONS.length],
      os: i % 4 === 0 ? 'Windows Server 2022' : 'Ubuntu 24.04 LTS',
      status,
      cpu: [1, 2, 4, 8][i % 4],
      ramGb: [2, 4, 8, 16][i % 4],
      storageGb: [40, 80, 160, 320][i % 4],
      cpuUsage: status === 'RUNNING' ? 12 + (i * 7) % 78 : 0,
      ramUsage: status === 'RUNNING' ? 18 + (i * 5) % 65 : 0,
      ip: `10.${20 + (i % 5)}.${(i * 3) % 255}.${(i * 11) % 255}`,
      hasGpu: i % 5 === 0,
      isSuspended: status === 'SUSPENDED',
      createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    };
  });
}

export function getDemoUsers(count = 10): AdminUserRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-user-${i}`,
    email: OWNERS[i % OWNERS.length],
    name: OWNERS[i % OWNERS.length].split('@')[0],
    role: i === 0 ? 'ADMIN' : i < 3 ? 'SUPPORT' : 'USER',
    plan: ['FREE', 'BASIC', 'PRO', 'PRO'][i % 4],
    balance: 12 + i * 8.5,
    credits: i % 3 === 0 ? 25 : 0,
    vpsCount: (i % 4) + 1,
    gpuCount: i % 5 === 0 ? 1 : 0,
    status: i === 6 ? 'SUSPENDED' : i === 7 ? 'FLAGGED' : 'ACTIVE',
    lastLogin: new Date(Date.now() - i * 3600000).toISOString(),
    referralCode: i % 2 === 0 ? `HEX${1000 + i}` : undefined,
  }));
}

export function getDemoInvoices(count = 8): AdminInvoice[] {
  const statuses = ['paid', 'unpaid', 'overdue', 'pending'] as const;
  return Array.from({ length: count }, (_, i) => ({
    id: `inv-${i}`,
    number: `HC-2026-${String(10420 + i).padStart(5, '0')}`,
    userEmail: OWNERS[i % OWNERS.length],
    amount: 24 + i * 18.5,
    status: statuses[i % statuses.length],
    dueDate: new Date(Date.now() + (i - 2) * 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    provider: i % 2 === 0 ? 'Stripe' : 'Razorpay',
  }));
}

export function getDemoNodes(): NodeHealth[] {
  return [
    { id: 'n1', name: 'node-mum-01', region: 'mumbai', status: 'healthy', cpu: 42, ram: 58, disk: 34, networkMbps: 890, vpsHosted: 124 },
    { id: 'n2', name: 'node-mum-02', region: 'mumbai', status: 'healthy', cpu: 67, ram: 71, disk: 45, networkMbps: 720, vpsHosted: 98 },
    { id: 'n3', name: 'node-sgp-01', region: 'singapore', status: 'degraded', cpu: 82, ram: 88, disk: 62, networkMbps: 540, vpsHosted: 156 },
    { id: 'n4', name: 'node-fra-01', region: 'frankfurt', status: 'healthy', cpu: 38, ram: 44, disk: 28, networkMbps: 1100, vpsHosted: 87 },
    { id: 'n5', name: 'node-us-01', region: 'virginia', status: 'critical', cpu: 94, ram: 91, disk: 78, networkMbps: 320, vpsHosted: 201 },
    { id: 'n6', name: 'node-tok-01', region: 'tokyo', status: 'healthy', cpu: 51, ram: 49, disk: 41, networkMbps: 650, vpsHosted: 72 },
  ];
}
