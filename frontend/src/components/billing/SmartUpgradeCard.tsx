import React, { useState } from 'react';
import { Zap, Loader2, X, ArrowUpRight } from 'lucide-react';
import type { PlanType, ProrationQuote } from '../../lib/billingUtils';
import { PLAN_PRICES_INR } from '../../lib/billingUtils';

interface SmartUpgradeCardProps {
  currentPlan: PlanType;
  targetPlan: 'BASIC' | 'PRO';
  quote: ProrationQuote;
  isLoading: boolean;
  onConfirm: () => void;
}

export const SmartUpgradeCard: React.FC<SmartUpgradeCardProps> = ({
  currentPlan,
  targetPlan,
  quote,
  isLoading,
  onConfirm,
}) => {
  const [open, setOpen] = useState(false);
  const targetInr = PLAN_PRICES_INR[targetPlan];

  if (currentPlan === targetPlan) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-all"
      >
        <Zap className="h-4 w-4" />
        Upgrade to {targetPlan} in 1 click
        <ArrowUpRight className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <h3 className="text-lg font-black text-slate-900">Smart upgrade</h3>
              <p className="text-xs text-slate-500 mt-1">
                Pro-rated billing · instant VPS resize · Razorpay checkout
              </p>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Current plan credit ({quote.daysRemaining}d left)</span>
                <span className="font-mono text-emerald-600">−₹{quote.creditInr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{targetPlan} prorated ({targetInr}/mo)</span>
                <span className="font-mono text-slate-800">₹{quote.newPlanProratedInr}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
                <span>Amount due (ex-GST)</span>
                <span className="font-mono">₹{quote.amountDueInr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18%)</span>
                <span className="font-mono">₹{quote.gstInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-indigo-700">
                <span>Total via Razorpay</span>
                <span className="font-mono">₹{quote.totalInr.toFixed(2)}</span>
              </div>
            </div>

            <ul className="text-[10px] text-slate-500 space-y-1 font-semibold">
              <li>✓ VPS CPU/RAM resized instantly to {targetPlan} limits</li>
              <li>✓ Invoice generated with GST breakdown</li>
              <li>✓ No manual plan migration required</li>
            </ul>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Pay ₹{quote.totalInr.toFixed(2)} &amp; upgrade now
            </button>
          </div>
        </div>
      )}
    </>
  );
};
