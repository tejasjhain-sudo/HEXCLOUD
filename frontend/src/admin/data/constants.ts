import type { AdminPlan, AdminRegion, MetricPoint } from '../types/admin';

export const REGIONS: AdminRegion[] = [
  { id: 'mumbai', label: 'Mumbai (ap-south)', flag: '🇮🇳', latencyMs: 12 },
  { id: 'singapore', label: 'Singapore (ap-southeast)', flag: '🇸🇬', latencyMs: 28 },
  { id: 'frankfurt', label: 'Frankfurt (eu-central)', flag: '🇩🇪', latencyMs: 94 },
  { id: 'virginia', label: 'Virginia (us-east)', flag: '🇺🇸', latencyMs: 142 },
  { id: 'tokyo', label: 'Tokyo (ap-northeast)', flag: '🇯🇵', latencyMs: 68 },
];

export const OS_OPTIONS = [
  { id: 'ubuntu-24', label: 'Ubuntu 24.04 LTS', icon: '🐧' },
  { id: 'ubuntu-22', label: 'Ubuntu 22.04 LTS', icon: '🐧' },
  { id: 'debian-12', label: 'Debian 12', icon: '🐧' },
  { id: 'windows-2022', label: 'Windows Server 2022', icon: '🪟' },
  { id: 'rocky-9', label: 'Rocky Linux 9', icon: '🐧' },
];

export const PLANS: AdminPlan[] = [
  { id: 'starter', name: 'Starter', priceMonthly: 8, vcpu: 1, ramGb: 2, storageGb: 40, bandwidthTb: 1, gpuIncluded: false, activeUsers: 1240 },
  { id: 'pro', name: 'Pro', priceMonthly: 24, vcpu: 2, ramGb: 4, storageGb: 80, bandwidthTb: 2, gpuIncluded: false, activeUsers: 892 },
  { id: 'business', name: 'Business', priceMonthly: 64, vcpu: 4, ramGb: 8, storageGb: 160, bandwidthTb: 4, gpuIncluded: false, activeUsers: 341 },
  { id: 'gpu-basic', name: 'GPU Basic', priceMonthly: 120, vcpu: 8, ramGb: 32, storageGb: 256, bandwidthTb: 5, gpuIncluded: true, activeUsers: 78 },
  { id: 'gpu-pro', name: 'GPU Pro', priceMonthly: 320, vcpu: 16, ramGb: 64, storageGb: 512, bandwidthTb: 10, gpuIncluded: true, activeUsers: 24 },
];

export function calcHourlyPrice(cpu: number, ram: number, storage: number, gpu: boolean, region: string): number {
  const base = 0.008 * cpu + 0.004 * ram + 0.00012 * storage;
  const gpuFee = gpu ? 0.45 : 0;
  const regionMult = region === 'mumbai' ? 0.92 : region === 'singapore' ? 1 : region === 'frankfurt' ? 1.08 : 1.12;
  return Math.round((base + gpuFee) * regionMult * 100) / 100;
}

export function generateHostname(seq: number): string {
  return `hex-vps-${String(seq).padStart(3, '0')}`;
}

export function buildMetricSeries(points = 24, base = 40, variance = 25): MetricPoint[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    t: now - (points - i) * 3600_000,
    v: Math.max(5, Math.min(98, base + Math.sin(i / 3) * variance + (Math.random() - 0.5) * 12)),
  }));
}
