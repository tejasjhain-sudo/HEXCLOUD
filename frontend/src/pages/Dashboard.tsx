import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatInr } from '../lib/vpsPricing';
import { TrialCreditsBanner } from '../components/TrialCreditsBanner';
import { TrialRequestPanel } from '../components/TrialRequestPanel';
import { Server, Cpu, Wallet, ShieldAlert, ArrowRight, Play, Square, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    user,
    vpsList,
    activeSession,
    fetchVps,
    fetchSessionStatus,
    startVps,
    stopVps,
  } = useStore();

  useEffect(() => {
    fetchVps();
    fetchSessionStatus();
  }, []);

  const activeVpsCount = vpsList.filter((v) => v.status === 'RUNNING').length;
  const provisioningVpsCount = vpsList.filter((v) => v.status === 'PROVISIONING').length;
  const totalVpsCount = vpsList.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Overview Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor, orchestrate, and manage your cloud deployments in real time.</p>
        </div>

        {/* Quick User summary */}
        <div className="flex items-center space-x-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
            Subscription: {user?.planType} Tier
          </span>
          {user?.role === 'ADMIN' && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-100">
              Admin Access Enabled
            </span>
          )}
        </div>
      </div>

      <TrialCreditsBanner />
      <TrialRequestPanel />

      {/* Warning callout if they don't have any premium bought instances */}
      {vpsList.length === 0 && !user?.trialActive && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-amber-900 flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 animate-bounce" />
              <span>You don't have any paid services running yet</span>
            </h3>
            <p className="text-amber-805 text-sm font-semibold max-w-2xl leading-relaxed">
              Upgrade to a paid infrastructure plan to spin up live web deployments, boot staging endpoints, or run remote GPU gaming sessions.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 rounded-2xl bg-amber-600 hover:bg-amber-700 px-6 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all shrink-0 self-start md:self-auto"
          >
            <span>Explore Pricing & Buy Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Wallet Balance</span>
            <div className="text-3xl font-black text-slate-900 font-mono">{formatInr(user?.walletBalance ?? 0)}</div>
            <Link to="/billing" className="inline-flex items-center space-x-1 text-xs text-indigo-650 hover:text-indigo-850 hover:underline font-semibold">
              <span>Add credits</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 border border-indigo-100 shrink-0">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* VPS Summary Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">VPS Instances</span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {totalVpsCount} <span className="text-xs font-semibold text-slate-400 font-sans">total</span>
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              <span className="text-emerald-600 font-bold">{activeVpsCount}</span> Running • <span className="text-amber-500 font-bold">{provisioningVpsCount}</span> Provisioning
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 border border-emerald-100 shrink-0">
            <Server className="h-6 w-6" />
          </div>
        </div>

        {/* GPU Session Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Cloud PC Status</span>
            <div className="text-lg font-black text-slate-900 truncate max-w-[200px]">
              {activeSession ? (
                activeSession.session.status === 'ACTIVE' ? (
                  <span className="text-purple-650 flex items-center space-x-1">
                    <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Active GPU Stream</span>
                  </span>
                ) : (
                  <span className="text-amber-600">In Queue (Pos #{activeSession.queuePosition})</span>
                )
              ) : (
                <span className="text-slate-400 font-normal">No active sessions</span>
              )}
            </div>
            <Link to="/cloud-pc" className="inline-flex items-center space-x-1 text-xs text-purple-650 hover:text-purple-850 hover:underline font-semibold">
              <span>Go to Cloud PC panel</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl bg-purple-50 p-3 text-purple-600 border border-purple-100 shrink-0">
            <Cpu className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Panel grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active VPS List Panel */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 lg:col-span-2 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Running services & instances</h2>
            <Link to="/vps" className="text-xs text-indigo-650 hover:text-indigo-850 font-bold flex items-center space-x-1">
              <span>Manage VPS</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* User VPS instances */}
            {vpsList.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Server className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No VPS instances yet.</p>
                <Link to="/vps" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold mt-2 inline-block">
                  Create your first VPS →
                </Link>
              </div>
            ) : (
            vpsList.map((vps) => (
              <Link
                key={vps.id}
                to={`/vps/${vps.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 border border-slate-200/60 rounded-2xl gap-4 hover:shadow-md hover:border-indigo-250 transition-all block cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">{vps.name}</span>
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      vps.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' :
                      vps.status === 'PROVISIONING' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                    }`} />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{vps.status}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    IP: <span className="font-mono text-slate-700">{vps.ipAddress}</span> • OS: <span className="font-semibold text-slate-700">{vps.osType}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-800 font-bold">{vps.cpu} vCPUs / {vps.ram} MB RAM</div>
                    <div className="text-[10px] text-slate-400 font-bold font-mono">{vps.storage} GB SSD</div>
                  </div>

                  <div className="flex space-x-2">
                    {vps.status === 'STOPPED' && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); startVps(vps.id); }}
                        className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors shadow-sm"
                        title="Start VM"
                      >
                        <Play className="h-4 w-4 fill-emerald-700" />
                      </button>
                    )}
                    {vps.status === 'RUNNING' && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); stopVps(vps.id); }}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm"
                        title="Stop VM"
                      >
                        <Square className="h-4 w-4 fill-rose-700" />
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))
            )}
          </div>
        </div>

        {/* Compute Quotas Panel */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Resource Allocation</h2>
          <div className="space-y-5">
            {/* CPU usage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>CPU Allocation</span>
                <span className="text-slate-800 font-bold">{vpsList.reduce((acc, curr) => acc + curr.cpu, 0)} / 8 Cores Limit</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-650 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (vpsList.reduce((acc, curr) => acc + curr.cpu, 0) / 8) * 100)}%` }}
                />
              </div>
            </div>

            {/* RAM usage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Memory Allocation</span>
                <span className="text-slate-800 font-bold">{(vpsList.reduce((acc, curr) => acc + curr.ram, 0) / 1024).toFixed(1)} / 16 GB Limit</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (vpsList.reduce((acc, curr) => acc + curr.ram, 0) / 16384) * 100)}%` }}
                />
              </div>
            </div>

            {/* SSD storage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Disk Allocation</span>
                <span className="text-slate-800 font-bold">{vpsList.reduce((acc, curr) => acc + curr.storage, 0)} / 500 GB Limit</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (vpsList.reduce((acc, curr) => acc + curr.storage, 0) / 500) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center space-x-2.5 text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-150 shadow-sm">
              <ShieldAlert className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Limits reset automatically at your monthly subscription billing cycle.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
