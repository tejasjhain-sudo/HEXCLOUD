import React, { useMemo } from 'react';
import { Activity, HardDrive, Network, Server } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricChart } from '../components/ui/MetricChart';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAdminNodes } from '../hooks/useAdminData';
import { buildMetricSeries } from '../data/constants';

export const AdminMonitoringPage: React.FC = () => {
  const nodes = useAdminNodes();
  const cpuData = useMemo(() => buildMetricSeries(32, 58, 20), []);
  const ramData = useMemo(() => buildMetricSeries(32, 62, 18), []);
  const netData = useMemo(() => buildMetricSeries(32, 450, 200), []);
  const diskData = useMemo(() => buildMetricSeries(32, 38, 15), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Resource Monitoring</h1>
        <p className="text-sm text-slate-500 mt-1">Grafana-style real-time metrics · WebSocket stream ready</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-4"><Activity className="h-4 w-4 text-cyan-400" /><span className="text-sm font-bold text-white">CPU</span></div>
          <MetricChart data={cpuData} label="Cluster CPU" unit="%" color="#22d3ee" height={140} />
        </GlassCard>
        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-4"><Server className="h-4 w-4 text-violet-400" /><span className="text-sm font-bold text-white">RAM</span></div>
          <MetricChart data={ramData} label="Cluster memory" unit="%" color="#a78bfa" height={140} />
        </GlassCard>
        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-4"><Network className="h-4 w-4 text-emerald-400" /><span className="text-sm font-bold text-white">Network</span></div>
          <MetricChart data={netData} label="Outbound Mbps" unit=" Mbps" color="#34d399" height={140} />
        </GlassCard>
        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-4"><HardDrive className="h-4 w-4 text-amber-400" /><span className="text-sm font-bold text-white">Disk</span></div>
          <MetricChart data={diskData} label="Storage utilization" unit="%" color="#fbbf24" height={140} />
        </GlassCard>
      </div>

      <GlassCard padding="lg">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Node health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((n) => (
            <div key={n.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-white">{n.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{n.region}</div>
                </div>
                <StatusBadge status={n.status} />
              </div>
              {(['cpu', 'ram', 'disk'] as const).map((m) => (
                <div key={m} className="mb-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span className="uppercase">{m}</span>
                    <span>{n[m]}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${n[m] > 85 ? 'bg-rose-500' : n[m] > 70 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                      style={{ width: `${n[m]}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="text-[10px] text-slate-600 mt-2">{n.networkMbps} Mbps · {n.vpsHosted} VPS</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
