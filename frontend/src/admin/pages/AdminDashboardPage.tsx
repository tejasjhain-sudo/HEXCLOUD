import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Users, DollarSign, Cpu, MemoryStick, HeartPulse, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricChart } from '../components/ui/MetricChart';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAdminStats, useAdminVpsList, useAdminNodes } from '../hooks/useAdminData';
import { buildMetricSeries } from '../data/constants';
import { useAdminContext } from '../context/AdminContext';

export const AdminDashboardPage: React.FC = () => {
  const stats = useAdminStats();
  const vpsList = useAdminVpsList().slice(0, 6);
  const nodes = useAdminNodes();
  const { wsConnected } = useAdminContext();
  const cpuSeries = buildMetricSeries(24, stats.cpuUsage, 15);
  const ramSeries = buildMetricSeries(24, stats.ramUsage, 12);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          High performance cloud VPS &amp; GPU infrastructure — <span className="text-cyan-400/80">HexCloud</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatCard label="VPS Running" value={stats.vpsRunning} sub={`${stats.vpsTotal} total instances`} icon={Server} accent="cyan" trend={{ value: '+12% vs last week', positive: true }} />
        <StatCard label="Active Users" value={stats.activeUsers} sub="Multi-tenant accounts" icon={Users} accent="purple" />
        <StatCard label="Monthly Revenue" value={`$${stats.monthlyRevenue.toLocaleString()}`} sub="Usage + subscriptions" icon={DollarSign} accent="emerald" trend={{ value: '+8.2% MRR', positive: true }} />
        <StatCard label="CPU Usage" value={`${stats.cpuUsage}%`} sub="Fleet average" icon={Cpu} accent="amber" />
        <StatCard label="RAM Usage" value={`${stats.ramUsage}%`} sub="Across all nodes" icon={MemoryStick} accent="purple" />
        <StatCard label="Node Health" value={`${stats.nodeHealth}%`} sub={`${nodes.filter((n) => n.status === 'healthy').length}/${nodes.length} healthy`} icon={HeartPulse} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Fleet metrics</h2>
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              Real-time · WebSocket ready
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MetricChart data={cpuSeries} label="CPU utilization" color="#22d3ee" />
            <MetricChart data={ramSeries} label="Memory utilization" color="#a78bfa" />
          </div>
        </GlassCard>

        <GlassCard padding="lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Node status</h2>
          <div className="space-y-3">
            {nodes.slice(0, 5).map((n) => (
              <div key={n.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{n.name}</div>
                  <div className="text-[10px] text-slate-500">{n.region} · {n.vpsHosted} VPS</div>
                </div>
                <StatusBadge status={n.status} />
              </div>
            ))}
          </div>
          <Link to="/admin/monitoring" className="mt-4 flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
            View monitoring <ArrowRight className="h-3 w-3" />
          </Link>
        </GlassCard>
      </div>

      <GlassCard padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent VPS activity</h2>
          <Link to="/admin/vps" className="text-xs text-cyan-400 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-slate-500 border-b border-white/10">
                <th className="pb-3 font-semibold">Instance</th>
                <th className="pb-3 font-semibold">Owner</th>
                <th className="pb-3 font-semibold">Region</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vpsList.map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-mono text-cyan-400/90">{v.name}</td>
                  <td className="py-3 text-slate-400">{v.owner}</td>
                  <td className="py-3 text-slate-500 text-xs">{v.region}</td>
                  <td className="py-3"><StatusBadge status={v.status} /></td>
                  <td className="py-3 text-right text-xs text-slate-400">{v.cpuUsage}% CPU</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
