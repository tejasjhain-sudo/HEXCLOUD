import type { UsageRecord } from '../types/billing';

export const USD_TO_INR = 83;
export const GST_RATE = 0.18;

export type PlanType = 'FREE' | 'BASIC' | 'PRO';
export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED';

export const PLAN_PRICES_INR: Record<PlanType, number> = {
  FREE: 0,
  BASIC: 830,
  PRO: 2075,
};

export const PLAN_SPECS: Record<PlanType, { cpu: number; ram: number; storage: number }> = {
  FREE: { cpu: 1, ram: 1024, storage: 20 },
  BASIC: { cpu: 2, ram: 4096, storage: 50 },
  PRO: { cpu: 4, ram: 8192, storage: 150 },
};

export interface UsageTimeSeries {
  labels: string[];
  cpu: number[];
  ram: number[];
  networkGb: number[];
  monthTotalInr: number;
  networkMonthGb: number;
}

export interface ProrationQuote {
  daysRemaining: number;
  creditInr: number;
  newPlanProratedInr: number;
  amountDueInr: number;
  gstInr: number;
  totalInr: number;
}

export interface InvoiceLineItem {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  status: InvoiceStatus;
  subtotalInr: number;
  gstInr: number;
  totalInr: number;
  provider?: string | null;
}

export function normalizeInvoiceStatus(status: string): InvoiceStatus {
  const s = status.toUpperCase();
  if (s === 'PAID') return 'PAID';
  if (s === 'FAILED') return 'FAILED';
  if (s === 'PENDING' || s === 'UNPAID') return 'PENDING';
  return 'PENDING';
}

export function amountWithGst(subtotalInr: number) {
  const gstInr = Math.round(subtotalInr * GST_RATE * 100) / 100;
  return { subtotalInr, gstInr, totalInr: subtotalInr + gstInr };
}

export function calcProration(
  currentPlan: PlanType,
  targetPlan: PlanType,
  periodEnd: string | null
): ProrationQuote {
  const end = periodEnd ? new Date(periodEnd) : new Date(Date.now() + 30 * 86400000);
  const now = new Date();
  const msLeft = Math.max(0, end.getTime() - now.getTime());
  const daysRemaining = Math.max(1, Math.ceil(msLeft / 86400000));
  const totalDays = 30;

  const currentMonthly = PLAN_PRICES_INR[currentPlan];
  const targetMonthly = PLAN_PRICES_INR[targetPlan];

  const creditInr = Math.round((currentMonthly / totalDays) * daysRemaining);
  const newPlanProratedInr = Math.round((targetMonthly / totalDays) * daysRemaining);
  const amountDueInr = Math.max(0, newPlanProratedInr - creditInr);
  const { gstInr, totalInr } = amountWithGst(amountDueInr);

  return {
    daysRemaining,
    creditInr,
    newPlanProratedInr,
    amountDueInr,
    gstInr,
    totalInr,
  };
}

/** Build 24h chart points from VPS fleet + usage records */
export function buildUsageTimeSeries(
  vpsCount: number,
  totalCpu: number,
  totalRamMb: number,
  usageRecords: UsageRecord[]
): UsageTimeSeries {
  const points = 24;
  const labels: string[] = [];
  const cpu: number[] = [];
  const ram: number[] = [];
  const networkGb: number[] = [];

  const baseCpu = Math.min(95, 12 + vpsCount * 8 + totalCpu * 3);
  const baseRam = Math.min(92, 18 + vpsCount * 6 + (totalRamMb / 1024) * 4);

  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * 3600000);
    labels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const wobble = Math.sin(i * 0.7 + vpsCount) * 8;
    cpu.push(Math.round(Math.max(5, Math.min(98, baseCpu + wobble + (i % 3) * 2))));
    ram.push(Math.round(Math.max(8, Math.min(96, baseRam + wobble * 0.8 + (i % 4)))));
    networkGb.push(Math.round((0.02 + vpsCount * 0.01 + (i % 5) * 0.008) * 100) / 100);
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthRecords = usageRecords.filter((u) => new Date(u.createdAt) >= monthStart);
  const usageCostInr = monthRecords.reduce((s, u) => s + u.cost * USD_TO_INR, 0);
  const networkMonthGb = monthRecords
    .filter((u) => u.resourceType === 'NETWORK')
    .reduce((s, u) => s + u.quantity, 0) || networkGb.reduce((a, b) => a + b, 0) * 12;

  const planBaseline = vpsCount > 0 ? 120 + totalCpu * 40 : 0;
  const monthTotalInr = Math.round((usageCostInr + planBaseline) * 100) / 100;

  return { labels, cpu, ram, networkGb, monthTotalInr, networkMonthGb: Math.round(networkMonthGb * 100) / 100 };
}

export function invoiceToLineItem(inv: {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  invoiceNumber?: string | null;
  provider?: string | null;
}): InvoiceLineItem {
  const subtotalInr = inv.amount * USD_TO_INR;
  const { gstInr, totalInr } = amountWithGst(subtotalInr);
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber ?? `INV-${inv.id.substring(0, 8).toUpperCase()}`,
    createdAt: inv.createdAt,
    status: normalizeInvoiceStatus(inv.status),
    subtotalInr,
    gstInr,
    totalInr,
    provider: inv.provider,
  };
}

export function downloadInvoicePdf(
  invoice: InvoiceLineItem,
  customer: { email: string; planType: string }
) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${invoice.invoiceNumber}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; max-width: 640px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  .muted { color: #64748b; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
  td, th { padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: left; }
  .right { text-align: right; }
  .total { font-weight: 800; font-size: 16px; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .paid { background: #ecfdf5; color: #047857; }
  .pending { background: #fffbeb; color: #b45309; }
  .failed { background: #fef2f2; color: #b91c1c; }
</style></head><body>
  <h1>HEXCloud Tax Invoice</h1>
  <p class="muted">${invoice.invoiceNumber} · ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}</p>
  <p><strong>Bill to:</strong> ${customer.email}<br><strong>Plan:</strong> ${customer.planType}</p>
  <span class="badge ${invoice.status.toLowerCase()}">${invoice.status}</span>
  <table>
    <tr><th>Description</th><th class="right">Amount (₹)</th></tr>
    <tr><td>Subscription / infrastructure charges</td><td class="right">${invoice.subtotalInr.toFixed(2)}</td></tr>
    <tr><td>GST (18%)</td><td class="right">${invoice.gstInr.toFixed(2)}</td></tr>
    <tr><td class="total">Total</td><td class="right total">₹${invoice.totalInr.toFixed(2)}</td></tr>
  </table>
  <p class="muted" style="margin-top:32px">Payment via Razorpay · HEXCloud Pvt Ltd · GSTIN: 29HEXCL0000A1Z5 (demo)</p>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      setTimeout(() => {
        win.print();
        URL.revokeObjectURL(url);
      }, 400);
    };
  }
}
