import React, { useState, useMemo } from 'react';
import {
  Plus, Play, Square, RotateCw, Trash2, Terminal, Camera, Key, ShieldAlert,
  RefreshCw, MoreHorizontal,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VpsCreatePanel } from '../components/VpsCreatePanel';
import { useAdminVpsList } from '../hooks/useAdminData';
import { useAdminContext } from '../context/AdminContext';
import { useStore } from '../../store/useStore';

export const AdminVpsPage: React.FC = () => {
  const vpsAll = useAdminVpsList();
  const { globalSearch } = useAdminContext();
  const { stopVpsAdmin, suspendVpsAdmin } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = globalSearch.toLowerCase();
    if (!q) return vpsAll;
    return vpsAll.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.owner.toLowerCase().includes(q) ||
        v.ip.includes(q),
    );
  }, [vpsAll, globalSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">VPS Instances</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length.toLocaleString()} instances · scalable to 100K+ with pagination
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-bold hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create VPS
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Snapshots', 'SSH Keys', 'Reinstall OS', 'Auto-scale', 'Abuse scan'].map((f) => (
          <span key={f} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-400">
            {f}
          </span>
        ))}
      </div>

      <GlassCard padding="lg" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead>
              <tr className="text-[10px] uppercase text-slate-500 border-b border-white/10">
                <th className="pb-3 font-semibold">Instance</th>
                <th className="pb-3 font-semibold">Owner</th>
                <th className="pb-3 font-semibold">Region</th>
                <th className="pb-3 font-semibold">OS</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Resources</th>
                <th className="pb-3 font-semibold">IP</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((v) => (
                <tr key={v.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="font-mono font-semibold text-white">{v.name}</div>
                    {v.hasGpu && <span className="text-[9px] text-violet-400 font-bold">GPU</span>}
                  </td>
                  <td className="py-4 text-slate-400">{v.owner}</td>
                  <td className="py-4 text-xs text-slate-500 uppercase">{v.region}</td>
                  <td className="py-4 text-slate-400 text-xs">{v.os}</td>
                  <td className="py-4"><StatusBadge status={v.status} /></td>
                  <td className="py-4">
                    <div className="text-xs text-slate-400">{v.cpu} vCPU · {v.ramGb}GB RAM</div>
                    <div className="flex gap-2 mt-1.5 w-32">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${v.cpuUsage}%` }} />
                      </div>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${v.ramUsage}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs text-cyan-400/80">{v.ip}</td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100">
                      {v.status !== 'RUNNING' && (
                        <button title="Start" className="p-2 rounded-lg hover:bg-emerald-500/20 text-emerald-400">
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {v.status === 'RUNNING' && (
                        <button title="Stop" onClick={() => !v.id.startsWith('demo') && stopVpsAdmin(v.id)} className="p-2 rounded-lg hover:bg-amber-500/20 text-amber-400">
                          <Square className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button title="Restart" className="p-2 rounded-lg hover:bg-white/10 text-slate-400"><RotateCw className="h-3.5 w-3.5" /></button>
                      <button title="Console" className="p-2 rounded-lg hover:bg-cyan-500/20 text-cyan-400"><Terminal className="h-3.5 w-3.5" /></button>
                      <button title="Snapshot" className="p-2 rounded-lg hover:bg-white/10 text-slate-400"><Camera className="h-3.5 w-3.5" /></button>
                      {!v.isSuspended && (
                        <button title="Suspend" onClick={() => !v.id.startsWith('demo') && suspendVpsAdmin(v.id)} className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400">
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button title="Delete" className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      <button className="p-2 rounded-lg hover:bg-white/10 text-slate-500"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages} · {filtered.length} results
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs disabled:opacity-40">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500">
        <GlassCard hover padding="md">
          <Key className="h-4 w-4 text-cyan-400 mb-2" />
          <div className="font-semibold text-white text-sm">SSH Key Manager</div>
          Centralized keys across tenants
        </GlassCard>
        <GlassCard hover padding="md">
          <RefreshCw className="h-4 w-4 text-violet-400 mb-2" />
          <div className="font-semibold text-white text-sm">One-click Reinstall</div>
          Reimage OS without losing IP
        </GlassCard>
        <GlassCard hover padding="md">
          <ShieldAlert className="h-4 w-4 text-rose-400 mb-2" />
          <div className="font-semibold text-white text-sm">Abuse Detection</div>
          ML traffic anomaly scoring
        </GlassCard>
      </div>

      <VpsCreatePanel open={createOpen} onClose={() => setCreateOpen(false)} sequence={vpsAll.length + 1} />
    </div>
  );
};
