import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Cpu, Server } from 'lucide-react';
import { OS_OPTIONS, REGIONS, calcHourlyPrice, generateHostname } from '../data/constants';
import { useAdminContext } from '../context/AdminContext';
import type { RegionId } from '../types/admin';

interface VpsCreatePanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: Record<string, unknown>) => void;
  sequence?: number;
}

export const VpsCreatePanel: React.FC<VpsCreatePanelProps> = ({
  open,
  onClose,
  onSubmit,
  sequence = 42,
}) => {
  const { region: globalRegion } = useAdminContext();
  const [os, setOs] = useState('ubuntu-24');
  const [cpu, setCpu] = useState(2);
  const [ram, setRam] = useState(4);
  const [storage, setStorage] = useState(80);
  const [region, setRegion] = useState<RegionId>(globalRegion);
  const [gpu, setGpu] = useState(false);
  const [hostname, setHostname] = useState(generateHostname(sequence));

  const hourly = useMemo(
    () => calcHourlyPrice(cpu, ram, storage, gpu, region),
    [cpu, ram, storage, gpu, region],
  );
  const monthly = (hourly * 730).toFixed(2);

  const handleGenerateHostname = () => setHostname(generateHostname(Math.floor(Math.random() * 900) + 100));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 glass-panel border-l border-white/10 overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-cyan-400" />
                  Create VPS Instance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Provision on HexCloud infrastructure</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="p-6 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.({ os, cpu, ram, storage, region, gpu, hostname });
                onClose();
              }}
            >
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hostname</label>
                <div className="flex gap-2 mt-2">
                  <input
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateHostname}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/10"
                    title="Auto-generate"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operating System</label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {OS_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOs(o.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                        os === o.id
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span>{o.icon}</span>
                      <span className="font-medium">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  CPU — {cpu} vCPU
                </label>
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={cpu}
                  onChange={(e) => setCpu(Number(e.target.value))}
                  className="w-full mt-2 accent-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  RAM — {ram} GB
                </label>
                <input
                  type="range"
                  min={1}
                  max={128}
                  step={1}
                  value={ram}
                  onChange={(e) => setRam(Number(e.target.value))}
                  className="w-full mt-2 accent-violet-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Storage — {storage} GB SSD
                </label>
                <input
                  type="range"
                  min={20}
                  max={2000}
                  step={10}
                  value={storage}
                  onChange={(e) => setStorage(Number(e.target.value))}
                  className="w-full mt-2 accent-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as RegionId)}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900">
                      {r.flag} {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setGpu(!gpu)}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${
                  gpu ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cpu className={`h-5 w-5 ${gpu ? 'text-violet-400' : 'text-slate-500'}`} />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">Attach GPU</div>
                    <div className="text-xs text-slate-500">NVIDIA A10 / L4 passthrough</div>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${gpu ? 'bg-violet-500' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${gpu ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </button>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
                <div className="text-xs text-slate-400 uppercase font-semibold">Pricing preview</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-white">${hourly.toFixed(2)}</span>
                  <span className="text-slate-500 text-sm">/ hour</span>
                </div>
                <div className="text-sm text-slate-400 mt-1">≈ ${monthly} / month (730h)</div>
                <div className="text-[10px] text-slate-600 mt-2">Usage-based billing · Billed per second when running</div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-neon-cyan"
              >
                Provision Instance
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
