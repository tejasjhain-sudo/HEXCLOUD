import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
}

const accents = {
  cyan: 'from-cyan-500/20 to-transparent text-cyan-400',
  purple: 'from-violet-500/20 to-transparent text-violet-400',
  emerald: 'from-emerald-500/20 to-transparent text-emerald-400',
  amber: 'from-amber-500/20 to-transparent text-amber-400',
  rose: 'from-rose-500/20 to-transparent text-rose-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent = 'cyan',
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="glass-panel rounded-2xl p-5 relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${accents[accent]} opacity-60`} />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`p-2 rounded-xl bg-white/5 ${accents[accent].split(' ').pop()}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {trend && (
        <p className={`text-[10px] font-semibold mt-2 ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  </motion.div>
);
