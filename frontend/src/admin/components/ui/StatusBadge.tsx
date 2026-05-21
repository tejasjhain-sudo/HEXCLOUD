import React from 'react';

const styles: Record<string, string> = {
  RUNNING: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  STOPPED: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  SUSPENDED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  PROVISIONING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ERROR: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  FLAGGED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  unpaid: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  overdue: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  pending: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  degraded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  offline: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
  OPEN: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  IN_PROGRESS: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
      styles[status] ?? styles.STOPPED
    } ${className}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
    {status.replace('_', ' ')}
  </span>
);
