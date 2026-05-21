import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import type { AdminVpsRow, AdminUserRow, AdminInvoice, NodeHealth } from '../types/admin';
import { getDemoInvoices, getDemoNodes, getDemoUsers, getDemoVpsRows } from '../data/demoData';
import type { ComputeNode } from '../../types/billing';

const REGION_CYCLE = ['mumbai', 'singapore', 'frankfurt', 'virginia', 'tokyo'] as const;

function mapStoreVpsToRows(): AdminVpsRow[] {
  const { adminVpsList } = useStore.getState();
  return adminVpsList.map((v, i) => ({
    id: v.id,
    name: v.name,
    owner: v.user.email,
    ownerId: '—',
    region: REGION_CYCLE[i % REGION_CYCLE.length],
    os: v.osType || 'Ubuntu 24.04 LTS',
    status: v.isSuspended ? 'SUSPENDED' : v.status === 'RUNNING' ? 'RUNNING' : v.status === 'STOPPED' ? 'STOPPED' : v.status as AdminVpsRow['status'],
    cpu: v.cpu,
    ramGb: Math.round(v.ram / 1024) || v.ram,
    storageGb: v.storage,
    cpuUsage: v.status === 'RUNNING' ? 20 + (i * 13) % 70 : 0,
    ramUsage: v.status === 'RUNNING' ? 25 + (i * 9) % 60 : 0,
    ip: v.ipAddress || '—',
    hasGpu: false,
    isSuspended: Boolean(v.isSuspended),
    createdAt: v.createdAt,
  }));
}

function mapStoreUsers(): AdminUserRow[] {
  const { adminUsers } = useStore.getState();
  return adminUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.email.split('@')[0],
    role: u.role === 'ADMIN' ? 'ADMIN' : 'USER',
    plan: u.planType,
    balance: u.walletBalance,
    credits: u.planType === 'FREE' ? 10 : 0,
    vpsCount: u._count.vpsInstances,
    gpuCount: u._count.gpuSessions,
    status: u.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
    lastLogin: u.createdAt,
  }));
}

function mapComputeNodes(nodes: ComputeNode[]): NodeHealth[] {
  if (!nodes.length) return getDemoNodes();
  return nodes.map((n, i) => {
    const cpu = Math.round((n.usedCpu / n.totalCpu) * 100);
    const ram = Math.round((n.usedRamGb / n.totalRamGb) * 100);
    return {
      id: n.id,
      name: n.name,
      region: REGION_CYCLE[i % REGION_CYCLE.length],
      status: n.status === 'OFFLINE' ? 'offline' : cpu > 90 ? 'critical' : cpu > 75 ? 'degraded' : 'healthy',
      cpu,
      ram,
      disk: 30 + (i * 7) % 50,
      networkMbps: 400 + (i * 120) % 800,
      vpsHosted: n.vpsCount,
    };
  });
}

export function useAdminVpsList(): AdminVpsRow[] {
  const adminVpsList = useStore((s) => s.adminVpsList);
  return useMemo(() => {
    const mapped = mapStoreVpsToRows();
    if (mapped.length >= 3) return mapped;
    return [...mapped, ...getDemoVpsRows(10 - mapped.length)];
  }, [adminVpsList]);
}

export function useAdminUserList(): AdminUserRow[] {
  const adminUsers = useStore((s) => s.adminUsers);
  return useMemo(() => {
    const mapped = mapStoreUsers();
    if (mapped.length >= 2) return mapped;
    return [...mapped, ...getDemoUsers(8 - mapped.length)];
  }, [adminUsers]);
}

export function useAdminInvoices(): AdminInvoice[] {
  const billingOverview = useStore((s) => s.billingOverview);
  return useMemo(() => {
    const demo = getDemoInvoices(10);
    if (billingOverview) {
      return demo.map((inv, i) =>
        i === 0 ? { ...inv, amount: billingOverview.monthlyRevenue / 4 } : inv,
      );
    }
    return demo;
  }, [billingOverview]);
}

export function useAdminNodes(): NodeHealth[] {
  const computeNodes = useStore((s) => s.computeNodes);
  return useMemo(() => mapComputeNodes(computeNodes), [computeNodes]);
}

export function useAdminStats() {
  const vpsList = useAdminVpsList();
  const users = useAdminUserList();
  const nodes = useAdminNodes();
  const billingOverview = useStore((s) => s.billingOverview);

  return useMemo(() => {
    const running = vpsList.filter((v) => v.status === 'RUNNING').length;
    const avgCpu = vpsList.length
      ? Math.round(vpsList.reduce((a, v) => a + v.cpuUsage, 0) / vpsList.length)
      : 0;
    const avgRam = vpsList.length
      ? Math.round(vpsList.reduce((a, v) => a + v.ramUsage, 0) / vpsList.length)
      : 0;
    const healthyNodes = nodes.filter((n) => n.status === 'healthy').length;

    return {
      vpsRunning: running,
      vpsTotal: vpsList.length,
      activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
      monthlyRevenue: billingOverview?.monthlyRevenue ?? 48290,
      cpuUsage: avgCpu,
      ramUsage: avgRam,
      nodeHealth: nodes.length ? Math.round((healthyNodes / nodes.length) * 100) : 92,
      unpaidInvoices: billingOverview?.unpaidInvoices ?? 7,
    };
  }, [vpsList, users, nodes, billingOverview]);
}
