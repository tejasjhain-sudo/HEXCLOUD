import React from 'react';
import { Cpu, PowerOff, Zap } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useStore } from '../../store/useStore';

export const AdminGpuPage: React.FC = () => {
  const { adminSessions, stopSessionAdmin } = useStore();

  const sessions = adminSessions.length
    ? adminSessions
    : [
        { id: 'g1', gpuType: 'NVIDIA A10', user: { email: 'ml@corp.ai' }, status: 'ACTIVE' as const },
        { id: 'g2', gpuType: 'NVIDIA L4', user: { email: 'dev@hexcloud.test' }, status: 'QUEUED' as const },
        { id: 'g3', gpuType: 'NVIDIA A100', user: { email: 'research@uni.edu' }, status: 'ACTIVE' as const },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">GPU Nodes</h1>
        <p className="text-sm text-slate-500 mt-1">High-performance GPU infrastructure · queue &amp; sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active sessions', value: sessions.filter((s) => s.status === 'ACTIVE').length, icon: Zap },
          { label: 'Queued', value: sessions.filter((s) => s.status === 'QUEUED').length, icon: Cpu },
          { label: 'GPU types', value: 'A10 · L4 · A100', icon: Cpu },
        ].map((s) => (
          <GlassCard key={s.label} padding="md">
            <s.icon className="h-5 w-5 text-violet-400 mb-2" />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard padding="lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-slate-500 border-b border-white/10">
              <th className="pb-3 text-left">GPU Type</th>
              <th className="pb-3 text-left">User</th>
              <th className="pb-3 text-left">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <td className="py-4 font-semibold text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-violet-400" />
                  {s.gpuType}
                </td>
                <td className="py-4 text-slate-400">{s.user.email}</td>
                <td className="py-4"><StatusBadge status={s.status} /></td>
                <td className="py-4 text-right">
                  {s.status !== 'ENDED' && (
                    <button
                      onClick={() => stopSessionAdmin(s.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 inline-flex"
                    >
                      <PowerOff className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
