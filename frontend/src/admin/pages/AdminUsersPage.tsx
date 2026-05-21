import React, { useMemo, useState } from 'react';
import { Ban, Gift, Shield, UserCog } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAdminUserList } from '../hooks/useAdminData';
import { useAdminContext } from '../context/AdminContext';
import { useStore } from '../../store/useStore';

export const AdminUsersPage: React.FC = () => {
  const users = useAdminUserList();
  const { globalSearch } = useAdminContext();
  const { suspendUser } = useStore();
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let list = users;
    const q = globalSearch.toLowerCase();
    if (q) list = list.filter((u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q));
    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [users, globalSearch, roleFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users &amp; Authentication</h1>
        <p className="text-sm text-slate-500 mt-1">Multi-tenant · RBAC: Admin / Support / User</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {['all', 'ADMIN', 'SUPPORT', 'USER'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              roleFilter === r ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {r === 'all' ? 'All roles' : r}
          </button>
        ))}
      </div>

      <GlassCard padding="lg">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-slate-500 border-b border-white/10">
              <th className="pb-3 font-semibold">User</th>
              <th className="pb-3 font-semibold">Role</th>
              <th className="pb-3 font-semibold">Plan</th>
              <th className="pb-3 font-semibold">Balance</th>
              <th className="pb-3 font-semibold">Credits</th>
              <th className="pb-3 font-semibold">Resources</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02]">
                <td className="py-4">
                  <div className="font-semibold text-white">{u.email}</div>
                  <div className="text-[10px] text-slate-600 font-mono">{u.id.slice(0, 12)}…</div>
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                    u.role === 'ADMIN' ? 'text-cyan-400' : u.role === 'SUPPORT' ? 'text-violet-400' : 'text-slate-400'
                  }`}>
                    {u.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="py-4"><span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 text-[10px] font-bold">{u.plan}</span></td>
                <td className="py-4 font-mono text-white">${u.balance.toFixed(2)}</td>
                <td className="py-4">
                  {u.credits > 0 ? (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><Gift className="h-3 w-3" />${u.credits}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-4 text-slate-400 text-xs">{u.vpsCount} VPS · {u.gpuCount} GPU</td>
                <td className="py-4"><StatusBadge status={u.status} /></td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400" title="Edit roles"><UserCog className="h-3.5 w-3.5" /></button>
                    {u.role !== 'ADMIN' && u.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => !u.id.startsWith('demo') && suspendUser(u.id)}
                        className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400"
                        title="Suspend"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassCard padding="lg">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Gift className="h-4 w-4 text-emerald-400" /> Referral &amp; credits</h2>
        <p className="text-sm text-slate-500">AWS-style free credits. Users earn $5–$25 per successful referral.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {users.filter((u) => u.referralCode).slice(0, 3).map((u) => (
            <div key={u.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-500">{u.email}</div>
              <div className="font-mono text-cyan-400 mt-1">{u.referralCode}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
