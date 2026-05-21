import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface BillingCycleCountdownProps {
  periodEnd: string | null;
}

export const BillingCycleCountdown: React.FC<BillingCycleCountdownProps> = ({ periodEnd }) => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      const end = periodEnd
        ? new Date(periodEnd).getTime()
        : new Date(Date.now() + 30 * 86400000).getTime();
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [periodEnd]);

  return (
    <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
      <Timer className="h-5 w-5 text-indigo-600 shrink-0" />
      <div>
        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Billing cycle ends in</div>
        <div className="text-lg font-black font-mono text-slate-900">{remaining}</div>
      </div>
    </div>
  );
};
