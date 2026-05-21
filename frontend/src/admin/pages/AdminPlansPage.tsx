import React from 'react';
import { Package, Pencil, Users } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { PLANS } from '../data/constants';

export const AdminPlansPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans &amp; Pricing</h1>
          <p className="text-sm text-slate-500 mt-1">Configure subscription tiers and resource limits</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-cyan-400 hover:bg-cyan-500/10">
          + New plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <GlassCard key={plan.id} hover padding="lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-violet-400" />
                  <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                </div>
                {plan.gpuIncluded && (
                  <span className="text-[10px] font-bold text-violet-400 mt-1 inline-block">GPU included</span>
                )}
              </div>
              <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400"><Pencil className="h-4 w-4" /></button>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">${plan.priceMonthly}</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>{plan.vcpu} vCPU · {plan.ramGb} GB RAM</li>
              <li>{plan.storageGb} GB SSD · {plan.bandwidthTb} TB bandwidth</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              {plan.activeUsers.toLocaleString()} active users
            </div>
            <div className="mt-3 text-[10px] text-slate-600">Per-user resource limits configurable</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
