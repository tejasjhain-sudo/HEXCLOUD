import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Play, Square, Trash, Terminal, Cpu, Info, PlusCircle, Wallet } from 'lucide-react';
import {
  VPS_TIERS,
  DEFAULT_VPS_TIER_ID,
  getVpsTierById,
  formatInr,
  type VpsTierId,
} from '../lib/vpsPricing';
import { TrialCreditsBanner } from '../components/TrialCreditsBanner';
import { TrialCreditsClaim } from '../components/TrialCreditsClaim';

export const Vps: React.FC = () => {
  const { vpsList, createVps, startVps, stopVps, deleteVps, fetchVps, fetchProfile, isLoading, error, setError, user } =
    useStore();

  const [name, setName] = useState('');
  const [osType, setOsType] = useState('Ubuntu 22.04');
  const [tierId, setTierId] = useState<VpsTierId>(DEFAULT_VPS_TIER_ID);
  const [storage, setStorage] = useState(50);
  const [selectedSshVm, setSelectedSshVm] = useState<string | null>(null);

  const selectedTier = getVpsTierById(tierId);
  const balance = user?.walletBalance ?? 0;
  const canAfford = balance >= selectedTier.priceInr;

  useEffect(() => {
    fetchVps();
    setError(null);
  }, []);

  const handleCreateVm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a name for the VPS instance');
      return;
    }
    if (!canAfford) {
      setError(
        `Insufficient credits. ${selectedTier.label} costs ${formatInr(selectedTier.priceInr)}. Add credits in Billing.`,
      );
      return;
    }

    await createVps({ name: name.trim(), osType, tierId, storage });
    if (!useStore.getState().error) {
      setName('');
      await fetchProfile();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">VPS Compute Nodes</h1>
        <p className="text-slate-500 text-sm mt-1">
          Deploy with wallet credits — up to 16 GB RAM and 8 vCPU per instance. All plans include 2 vCPU.
        </p>
      </div>

      <TrialCreditsBanner />
      <TrialCreditsClaim />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900">
              <PlusCircle className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold">Deploy New Instance</h2>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3">
            <div className="flex items-center gap-2 text-indigo-900">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-bold">Wallet credits</span>
            </div>
            <span className="text-lg font-black text-indigo-700">{formatInr(balance)}</span>
          </div>

          <form onSubmit={handleCreateVm} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">VM Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="prod-web-server"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-all text-slate-950 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Operating System</label>
              <select
                value={osType}
                onChange={(e) => setOsType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-indigo-650 transition-all text-slate-950 font-semibold"
              >
                <option value="Ubuntu 22.04">Ubuntu 22.04 LTS</option>
                <option value="Ubuntu 24.04">Ubuntu 24.04 LTS</option>
                <option value="Debian 12">Debian 12 Bookworm</option>
                <option value="CentOS 9">CentOS Stream 9</option>
                <option value="Windows Server 2022">Windows Server 2022</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Plan (2 vCPU · billed once at deploy)</label>
              <div className="grid grid-cols-1 gap-2">
                {VPS_TIERS.map((tier) => {
                  const selected = tierId === tier.id;
                  const affordable = balance >= tier.priceInr;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setTierId(tier.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      } ${!affordable ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{tier.label}</span>
                        <span className={`text-sm font-black ${selected ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {formatInr(tier.priceInr)}
                        </span>
                      </div>
                      {!affordable && (
                        <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Need more credits</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <label>Disk Space (SSD)</label>
                <span className="text-slate-800">{storage} GB</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={storage}
                onChange={(e) => setStorage(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Total due now: </span>
              {formatInr(selectedTier.priceInr)}
              <span className="text-slate-500"> — deducted from credits on deploy</span>
            </div>

            {error && (
              <div className="flex items-start space-x-2 rounded-xl bg-rose-50 p-3 text-rose-700 border border-rose-100 text-xs">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !canAfford}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading
                ? 'Allocating Resources...'
                : canAfford
                  ? `Deploy — ${formatInr(selectedTier.priceInr)}`
                  : 'Insufficient credits'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {vpsList.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm space-y-4">
              <Cpu className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No active VPS nodes</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Pick a plan and deploy. Each size is charged once from your wallet credits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vpsList.map((vps) => (
                <div
                  key={vps.id}
                  className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <h3 className="font-extrabold text-slate-900">{vps.name}</h3>
                        <span
                          className={`inline-flex items-center space-x-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            vps.status === 'RUNNING'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : vps.status === 'PROVISIONING'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              vps.status === 'RUNNING'
                                ? 'bg-emerald-500 animate-pulse'
                                : vps.status === 'PROVISIONING'
                                  ? 'bg-amber-500 animate-pulse'
                                  : 'bg-rose-500'
                            }`}
                          />
                          <span>{vps.status}</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        OS: <span className="font-bold text-slate-700">{vps.osType}</span> • Created:{' '}
                        <span className="font-semibold text-slate-700">
                          {new Date(vps.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {vps.status === 'STOPPED' && (
                        <button
                          onClick={() => startVps(vps.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-xs font-bold transition-colors"
                        >
                          <Play className="h-3 w-3 fill-emerald-700" />
                          <span>Boot</span>
                        </button>
                      )}
                      {vps.status === 'RUNNING' && (
                        <button
                          onClick={() => stopVps(vps.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 text-xs font-bold transition-colors"
                        >
                          <Square className="h-3 w-3 fill-amber-700" />
                          <span>Power Off</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteVps(vps.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 text-xs font-bold transition-colors"
                      >
                        <Trash className="h-3 w-3 fill-rose-700" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">vCPUs</span>
                      <div className="text-sm font-black text-slate-800">{vps.cpu} Cores</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RAM</span>
                      <div className="text-sm font-black text-slate-800">
                        {vps.ram >= 1024 ? `${(vps.ram / 1024).toFixed(0)} GB` : `${vps.ram} MB`}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Disk</span>
                      <div className="text-sm font-black text-slate-800">{vps.storage} GB NVMe</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IP Address</span>
                      <div className="text-sm font-mono font-black text-indigo-650">{vps.ipAddress}</div>
                    </div>
                  </div>

                  {vps.status === 'RUNNING' && (
                    <div className="border-t border-slate-100 pt-4">
                      <button
                        onClick={() => setSelectedSshVm(selectedSshVm === vps.id ? null : vps.id)}
                        className="flex items-center space-x-1.5 text-xs text-indigo-650 hover:text-indigo-850 hover:underline font-bold"
                      >
                        <Terminal className="h-3.5 w-3.5" />
                        <span>
                          {selectedSshVm === vps.id ? 'Hide SSH Instructions' : 'View SSH Connection Instructions'}
                        </span>
                      </button>

                      {selectedSshVm === vps.id && (
                        <div className="mt-3 rounded-2xl bg-slate-950 p-4 border border-slate-900 space-y-3 font-sans shadow-md">
                          <div className="text-xs text-slate-400">
                            Connect to this VPS instance via terminal using key-based authentication:
                          </div>
                          <div className="flex items-center justify-between bg-slate-900/60 px-3.5 py-2.5 rounded-xl border border-white/5 text-xs font-mono text-emerald-400 overflow-x-auto">
                            <span>ssh -i ~/.ssh/hexcloud_id_rsa root@{vps.ipAddress}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            * Note: Make sure to set matching permissions for your local private key:{' '}
                            <code>chmod 600 ~/.ssh/hexcloud_id_rsa</code>.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
