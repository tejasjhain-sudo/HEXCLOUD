import React, { useEffect, useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatInr } from '../lib/vpsPricing';

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export const TrialCreditsBanner: React.FC = () => {
  const user = useStore((s) => s.user);
  const fetchProfile = useStore((s) => s.fetchProfile);
  const [remaining, setRemaining] = useState(user?.trialMsRemaining ?? 0);

  useEffect(() => {
    if (!user?.trialActive || !user.trialExpiresAt) return;
    const tick = () => {
      const ms = Math.max(0, new Date(user.trialExpiresAt!).getTime() - Date.now());
      setRemaining(ms);
      if (ms <= 0) fetchProfile();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [user?.trialActive, user?.trialExpiresAt, fetchProfile]);

  if (!user?.trialActive || user.role === 'ADMIN') return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="flex items-start gap-2">
        <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Testing credits active</p>
          <p className="text-xs text-amber-800/90">
            {formatInr(user.walletBalance)} to deploy VPS on the demo sandbox node. Credits expire after 2 hours.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-200 rounded-full px-3 py-1.5 w-fit">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatCountdown(remaining)} left</span>
      </div>
    </div>
  );
};
