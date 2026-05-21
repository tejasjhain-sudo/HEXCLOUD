import React, { useEffect, useState } from 'react';
import { Loader2, Shield, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatInr } from '../lib/vpsPricing';

const API = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
const TURNSTILE_SITE = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

async function getFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('hexcloud-fp', 2, 2);
  }
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    canvas.toDataURL(),
  ].join('|');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const TrialCreditsClaim: React.FC = () => {
  const token = useStore((s) => s.token);
  const user = useStore((s) => s.user);
  const fetchProfile = useStore((s) => s.fetchProfile);
  const setError = useStore((s) => s.setError);

  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE || !window.turnstile) return;
    const id = 'hex-turnstile';
    const el = document.getElementById(id);
    if (!el) return;
    window.turnstile.render(el, {
      sitekey: TURNSTILE_SITE,
      callback: (t: string) => setTurnstileToken(t),
    });
  }, []);

  if (!token || !user || user.role === 'ADMIN' || user.trialActive) return null;

  const claimV2 = async () => {
    setLoading(true);
    setError(null);
    try {
      const fingerprint = await getFingerprint();
      const res = await fetch(`${API}/api/v2/trial/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fingerprint,
          turnstileToken: turnstileToken || 'dev-bypass',
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Claim failed');
      setMsg(body.message);
      await fetchProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not claim trial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-6 w-6 text-indigo-600 shrink-0" />
        <div>
          <h2 className="text-lg font-black text-slate-900">Free 2-hour VPS trial</h2>
          <p className="text-sm text-slate-600 mt-1">
            Protected by Cloudflare Turnstile, device fingerprint, and IP checks. One trial per device/network.
            Grants {formatInr(10000)} sandbox credits.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Shield className="h-4 w-4" />
        <span>VPN/proxy/datacenter IPs blocked · Auto-delete VPS when timer ends</span>
      </div>

      {TURNSTILE_SITE && <div id="hex-turnstile" className="min-h-[65px]" />}

      <button
        type="button"
        disabled={loading}
        onClick={claimV2}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Claim trial credits
      </button>

      {msg && (
        <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {msg}
        </p>
      )}

      <p className="text-[10px] text-slate-500">
        New stack: email OTP login + <code className="font-mono">/api/v2/trial/claim</code>. Migrate to Next.js app in{' '}
        <code className="font-mono">apps/web</code> for full UI.
      </p>
    </div>
  );
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => void;
    };
  }
}
