import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  Repeat, Info, CheckCircle2, BarChart3, FileText, CreditCard,
  Trash2, Star, Activity, Wifi,
} from 'lucide-react';
import { isRazorpayConfigured } from '../lib/payments';
import {
  PLAN_PRICES_INR,
  calcProration,
  invoiceToLineItem,
  downloadInvoicePdf,
  amountWithGst,
  type PlanType,
} from '../lib/billingUtils';
import { UsageLineChart } from '../components/billing/UsageLineChart';
import { BillingCycleCountdown } from '../components/billing/BillingCycleCountdown';
import { InvoiceHistoryTable } from '../components/billing/InvoiceHistoryTable';
import { SmartUpgradeCard } from '../components/billing/SmartUpgradeCard';
import { BillingTrustBar } from '../components/billing/BillingTrustBar';

type BillingTab = 'subscription' | 'usage' | 'invoices' | 'payment-methods';

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free Tier',
  BASIC: 'VPS Basic',
  PRO: 'VPS Pro',
};

const PLANS = [
  { id: 'FREE' as const, name: 'Free Tier', priceInr: 0, features: ['1 VPS', '1 vCPU', '1GB RAM'] },
  { id: 'BASIC' as const, name: 'VPS Basic', priceInr: 830, features: ['2 VPS', '2 vCPU', '4GB RAM'] },
  { id: 'PRO' as const, name: 'VPS Pro', priceInr: 2075, features: ['5 VPS', '4 vCPU', '8GB RAM'] },
];

export const Billing: React.FC = () => {
  const {
    user,
    subscription,
    invoices,
    usageMetrics,
    paymentMethods,
    fetchBillingData,
    upgradePlanOneClick,
    changePlan,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    createBillingSupportTicket,
    isLoading,
    error,
    setError,
  } = useStore();

  const [tab, setTab] = useState<BillingTab>('subscription');
  const [newCard, setNewCard] = useState({ brand: 'Visa', last4: '', expMonth: '', expYear: '' });

  useEffect(() => {
    fetchBillingData();
    setError(null);
  }, []);

  const activePlan = (subscription?.planType ?? user?.planType ?? 'FREE') as PlanType;
  const invoiceLines = useMemo(() => invoices.map(invoiceToLineItem), [invoices]);

  const upgradeTarget: 'BASIC' | 'PRO' | null =
    activePlan === 'FREE' ? 'BASIC' : activePlan === 'BASIC' ? 'PRO' : null;

  const prorationQuote = upgradeTarget
    ? calcProration(activePlan, upgradeTarget, subscription?.currentPeriodEnd ?? null)
    : null;

  const tabs: { id: BillingTab; label: string; icon: React.ElementType }[] = [
    { id: 'subscription', label: 'Subscription', icon: Repeat },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
  ];

  const handleDownloadPdf = (inv: ReturnType<typeof invoiceToLineItem>) => {
    if (!user) return;
    downloadInvoicePdf(inv, { email: user.email, planType: user.planType });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Billing</h1>
          <p className="text-slate-500 text-sm mt-1">Subscriptions, usage analytics, GST invoices — Razorpay.</p>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
          isRazorpayConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          Razorpay {isRazorpayConfigured ? '· live' : '· demo'}
        </span>
      </div>

      {error && (
        <div className="flex items-start space-x-2 rounded-xl bg-rose-50 p-4 text-rose-700 border border-rose-100 text-sm max-w-xl">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              tab === id ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white border-slate-200/60 text-slate-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'subscription' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active subscription</div>
              <div className="text-2xl font-black text-slate-900">{PLAN_LABELS[activePlan]}</div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="h-3 w-3" />
                {subscription?.status ?? 'ACTIVE'}
              </span>
              {activePlan !== 'FREE' && (
                <p className="text-sm text-slate-600">
                  ₹{PLAN_PRICES_INR[activePlan]}/mo + 18% GST on invoices
                </p>
              )}
              {activePlan !== 'FREE' && (
                <button
                  onClick={() => cancelSubscription()}
                  disabled={isLoading}
                  className="text-xs font-bold text-rose-600 hover:underline disabled:opacity-50"
                >
                  Cancel subscription
                </button>
              )}
            </div>
            <BillingCycleCountdown periodEnd={subscription?.currentPeriodEnd ?? null} />
          </div>

          {upgradeTarget && prorationQuote && (
            <SmartUpgradeCard
              currentPlan={activePlan}
              targetPlan={upgradeTarget}
              quote={prorationQuote}
              isLoading={isLoading}
              onConfirm={() => upgradePlanOneClick(upgradeTarget)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = activePlan === plan.id;
              const { totalInr } = amountWithGst(plan.priceInr);
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-5 border flex flex-col justify-between space-y-4 shadow-sm ${
                    isCurrent ? 'border-2 border-indigo-600' : 'border-slate-200/60'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{plan.name}</span>
                    <div className="text-2xl font-black text-slate-900">
                      {plan.priceInr > 0 ? `₹${totalInr}` : 'Free'}
                      {plan.priceInr > 0 && <span className="text-xs text-slate-500 font-normal">/mo incl. GST</span>}
                    </div>
                  </div>
                  {plan.id === 'FREE' ? (
                    <button
                      onClick={() => changePlan('FREE')}
                      disabled={isCurrent || isLoading}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 disabled:opacity-50"
                    >
                      {isCurrent ? 'Current' : 'Downgrade'}
                    </button>
                  ) : isCurrent ? (
                    <span className="text-center text-xs font-bold text-indigo-600 py-2">Current plan</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'usage' && usageMetrics && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-200 uppercase">This month</div>
              <div className="text-3xl font-black font-mono">₹{usageMetrics.monthTotalInr.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-indigo-200 mt-1">Estimated · incl. compute & network</div>
            </div>
            <Activity className="h-10 w-10 text-white/40" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <UsageLineChart title="CPU usage (24h)" labels={usageMetrics.labels} values={usageMetrics.cpu} unit="%" color="#6366f1" />
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <UsageLineChart title="RAM usage (24h)" labels={usageMetrics.labels} values={usageMetrics.ram} unit="%" color="#a855f7" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">Network usage</span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-700">{usageMetrics.networkMonthGb} GB</span>
            </div>
            <UsageLineChart
              title="Hourly egress (GB)"
              labels={usageMetrics.labels}
              values={usageMetrics.networkGb}
              unit=" GB"
              color="#10b981"
              max={Math.max(1, ...usageMetrics.networkGb) * 1.2}
            />
          </div>
        </div>
      )}

      {tab === 'usage' && !usageMetrics && (
        <div className="text-center py-12 text-slate-400 text-sm">Loading usage metrics…</div>
      )}

      {tab === 'invoices' && (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Invoice history</h2>
          <p className="text-xs text-slate-500">Download PDF tax invoices with GST line items. Status: Paid, Pending, or Failed.</p>
          <InvoiceHistoryTable invoices={invoiceLines} onDownload={handleDownloadPdf} />
        </div>
      )}

      {tab === 'payment-methods' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900">Razorpay payment methods</h3>
            {paymentMethods.length === 0 ? (
              <p className="text-slate-400 text-sm py-6 text-center">No saved methods.</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="font-bold text-slate-800 text-sm">
                          {pm.brand} ···· {pm.last4}
                          {pm.isDefault && <span className="ml-2 text-[9px] text-indigo-600 font-black">DEFAULT</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {!pm.isDefault && (
                        <button type="button" onClick={() => setDefaultPaymentMethod(pm.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => removePaymentMethod(pm.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <form
            className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (newCard.last4.length !== 4) {
                setError('Enter last 4 digits');
                return;
              }
              addPaymentMethod({
                brand: newCard.brand,
                last4: newCard.last4,
                expMonth: newCard.expMonth ? parseInt(newCard.expMonth, 10) : undefined,
                expYear: newCard.expYear ? parseInt(newCard.expYear, 10) : undefined,
              });
              setNewCard({ brand: 'Visa', last4: '', expMonth: '', expYear: '' });
            }}
          >
            <h3 className="font-bold text-slate-900">Add method</h3>
            <input placeholder="Brand" value={newCard.brand} onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <input placeholder="Last 4" maxLength={4} value={newCard.last4} onChange={(e) => setNewCard({ ...newCard, last4: e.target.value.replace(/\D/g, '') })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">
              Save
            </button>
          </form>
        </div>
      )}

      <BillingTrustBar isLoading={isLoading} onOpenTicket={createBillingSupportTicket} />
    </div>
  );
};
