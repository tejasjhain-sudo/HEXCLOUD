'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getFingerprint } from '@/lib/api';

type TrialStatus = {
  hasTrial: boolean;
  canClaim: boolean;
  trial?: {
    msRemaining: number;
    active: boolean;
    creditsInr: number;
    vps: { id: string; name: string; status: string; ipAddress: string | null }[];
  };
};

function formatMs(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('hex_token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    api<TrialStatus>('/api/v2/trial/status', { token })
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, [token]);

  const claim = async () => {
    if (!token) return;
    setError(null);
    try {
      const fingerprint = await getFingerprint();
      await api('/api/v2/trial/claim', {
        method: 'POST',
        token,
        body: JSON.stringify({ fingerprint, turnstileToken: 'dev-bypass' }),
      });
      const s = await api<TrialStatus>('/api/v2/trial/status', { token });
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Claim failed');
    }
  };

  if (!token) {
    return (
      <main className="p-10">
        <Link href="/login" className="text-accent">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm">VPS trial · usage · controls</p>
        </div>
        <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
          Admin
        </Link>
      </header>

      {status?.trial?.active && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
          <p className="font-semibold text-amber-200">Trial active — {formatInr(status.trial.creditsInr)}</p>
          <p className="text-2xl font-mono mt-2">{formatMs(status.trial.msRemaining)} remaining</p>
        </div>
      )}

      {status?.canClaim && (
        <button onClick={claim} className="rounded-xl bg-accent px-6 py-3 font-semibold">
          Claim 2-hour free trial
        </button>
      )}

      <section className="rounded-2xl border border-slate-700 bg-surface p-6 space-y-4">
        <h2 className="font-semibold">Instances</h2>
        {(status?.trial?.vps ?? []).map((v) => (
          <div key={v.id} className="flex justify-between items-center border border-slate-700 rounded-xl p-4">
            <div>
              <p className="font-mono font-semibold">{v.name}</p>
              <p className="text-xs text-slate-400">
                {v.status} · {v.ipAddress || 'provisioning…'}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded bg-slate-700">Start</button>
              <button className="text-xs px-3 py-1 rounded bg-slate-700">Stop</button>
              <button className="text-xs px-3 py-1 rounded bg-rose-900/50 text-rose-200">Reinstall</button>
            </div>
          </div>
        ))}
        {!status?.trial?.vps?.length && <p className="text-sm text-slate-500">No VPS yet.</p>}
      </section>

      {error && <p className="text-rose-400 text-sm">{error}</p>}
    </main>
  );
}

function formatInr(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
