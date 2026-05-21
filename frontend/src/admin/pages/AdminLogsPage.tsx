import React, { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useStore } from '../../store/useStore';
import type { LogCategory } from '../types/admin';

const DEMO_LOGS = [
  { id: '1', level: 'INFO', service: 'vps-controller', message: 'Instance hex-vps-012 started in mumbai', category: 'vps' as LogCategory, createdAt: new Date().toISOString() },
  { id: '2', level: 'WARN', service: 'billing', message: 'Invoice HC-2026-10422 overdue by 3 days', category: 'billing' as LogCategory, createdAt: new Date().toISOString() },
  { id: '3', level: 'INFO', service: 'auth', message: 'Admin login from 103.22.1.44', category: 'auth' as LogCategory, createdAt: new Date().toISOString() },
  { id: '4', level: 'ERROR', service: 'node-agent', message: 'node-us-01 disk threshold exceeded', category: 'system' as LogCategory, createdAt: new Date().toISOString() },
];

export const AdminLogsPage: React.FC = () => {
  const adminLogs = useStore((s) => s.adminLogs);
  const [category, setCategory] = useState<LogCategory | 'all'>('all');
  const [level, setLevel] = useState<string>('all');
  const [search, setSearch] = useState('');

  const logs = useMemo(() => {
    const base = adminLogs.length
      ? adminLogs.map((l) => ({
          ...l,
          category: (l.service.includes('auth') ? 'auth' : l.service.includes('bill') ? 'billing' : l.service.includes('vps') ? 'vps' : 'system') as LogCategory,
        }))
      : DEMO_LOGS;
    return base.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (level !== 'all' && l.level !== level) return false;
      if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [adminLogs, category, level, search]);

  const levelClass = (lv: string) => {
    if (lv === 'ERROR') return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
    if (lv === 'WARN') return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Logs &amp; Events</h1>
        <p className="text-sm text-slate-500 mt-1">System · VPS · Auth · Billing audit trail</p>
      </div>

      <GlassCard padding="md">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500/40"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <option value="all">All categories</option>
            <option value="system">System</option>
            <option value="vps">VPS</option>
            <option value="auth">Auth</option>
            <option value="billing">Billing</option>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <option value="all">All levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
          <Filter className="h-4 w-4 text-slate-500" />
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <div className="space-y-2 max-h-[600px] overflow-y-auto font-mono text-xs">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10">
              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold shrink-0 ${levelClass(log.level)}`}>{log.level}</span>
              <span className="text-violet-400 shrink-0">[{log.service}]</span>
              <span className="text-slate-500 shrink-0 uppercase text-[9px]">{log.category}</span>
              <span className="text-slate-300 flex-1">{log.message}</span>
              <span className="text-slate-600 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
