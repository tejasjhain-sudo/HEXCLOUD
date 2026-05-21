/** VPS tiers — must match backend/src/config/vpsPricing.ts */
export const VPS_MAX_CPU = 8;
export const VPS_MAX_RAM_MB = 16384;

export type VpsTierId = '1gb-2cpu' | '2gb-2cpu' | '4gb-2cpu' | '8gb-2cpu' | '16gb-2cpu';

export interface VpsTier {
  id: VpsTierId;
  label: string;
  cpu: number;
  ramMb: number;
  priceInr: number;
}

export const VPS_TIERS: readonly VpsTier[] = [
  { id: '1gb-2cpu', label: '1 GB RAM · 2 vCPU', cpu: 2, ramMb: 1024, priceInr: 200 },
  { id: '2gb-2cpu', label: '2 GB RAM · 2 vCPU', cpu: 2, ramMb: 2048, priceInr: 400 },
  { id: '4gb-2cpu', label: '4 GB RAM · 2 vCPU', cpu: 2, ramMb: 4096, priceInr: 570 },
  { id: '8gb-2cpu', label: '8 GB RAM · 2 vCPU', cpu: 2, ramMb: 8192, priceInr: 770 },
  { id: '16gb-2cpu', label: '16 GB RAM · 2 vCPU', cpu: 2, ramMb: 16384, priceInr: 1500 },
] as const;

export const DEFAULT_VPS_TIER_ID: VpsTierId = '4gb-2cpu';

export function getVpsTierById(id: VpsTierId): VpsTier {
  return VPS_TIERS.find((t) => t.id === id) ?? VPS_TIERS[2];
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
