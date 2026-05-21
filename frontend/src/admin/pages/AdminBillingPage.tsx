import React from 'react';
import { DollarSign, Clock, FileText, Wallet, CreditCard } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAdminInvoices, useAdminStats, useAdminUserList } from '../hooks/useAdminData';
import { useStore } from '../../store/useStore';

export const AdminBillingPage: React.FC = () => {
  const invoices = useAdminInvoices();
  const stats = useAdminStats();
  const users = useAdminUserList();
  const billingOverview = useStore((s) => s.billingOverview);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing &amp; Invoices</h1>
        <p className="text-sm text-slate-500 mt-1">Usage-based per-hour billing · Stripe &amp; Razorpay</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${(billingOverview?.totalRevenue ?? 128400).toLocaleString()}`} icon={DollarSign} accent="emerald" />
        <StatCard label="This Month" value={`$${stats.monthlyRevenue.toLocaleString()}`} icon={Clock} accent="cyan" />
        <StatCard label="Unpaid" value={stats.unpaidInvoices} sub="Invoices outstanding" icon={FileText} accent="amber" />
        <StatCard label="Active Subs" value={billingOverview?.activeSubscriptions ?? 156} icon={CreditCard} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" padding="lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Invoices</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-slate-500 border-b border-white/10">
                <th className="pb-3 text-left">Invoice</th>
                <th className="pb-3 text-left">Customer</th>
                <th className="pb-3 text-left">Amount</th>
                <th className="pb-3 text-left">Status</th>
                <th className="pb-3 text-left">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-mono text-cyan-400/90">{inv.number}</td>
                  <td className="py-3 text-slate-400">{inv.userEmail}</td>
                  <td className="py-3 font-semibold text-white">${inv.amount.toFixed(2)}</td>
                  <td className="py-3"><StatusBadge status={inv.status} /></td>
                  <td className="py-3 text-slate-500 text-xs">{inv.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>

        <GlassCard padding="lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-cyan-400" /> User balances
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {users.slice(0, 8).map((u) => (
              <div key={u.id} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-slate-400 truncate max-w-[140px]">{u.email}</span>
                <span className="font-mono text-sm text-white">${u.balance.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard padding="lg">
        <h2 className="text-sm font-bold text-white mb-2">AWS-style credits</h2>
        <p className="text-sm text-slate-500">
          Grant promotional credits to tenants. Credits apply before wallet balance on hourly VPS/GPU usage.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['$10 trial', '$25 referral', '$100 enterprise', 'Custom grant'].map((c) => (
            <button key={c} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400">
              {c}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
