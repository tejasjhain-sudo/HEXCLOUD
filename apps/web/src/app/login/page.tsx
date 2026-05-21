'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ message: string; demoCode?: string }>('/api/v2/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
      if (res.demoCode) setError(`Dev OTP: ${res.demoCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      const fp = await import('@/lib/api').then((m) => m.getFingerprint());
      const res = await api<{ token: string }>('/api/v2/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code, fingerprint: fp }),
      });
      localStorage.setItem('hex_token', res.token);
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-surface p-8 shadow-2xl space-y-4">
        <h1 className="text-2xl font-bold">HEXCloud</h1>
        <p className="text-sm text-slate-400">Passwordless email OTP login</p>
        <input
          className="w-full rounded-lg bg-panel border border-slate-600 px-4 py-3 text-sm"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!sent ? (
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-white disabled:opacity-50"
          >
            Send OTP
          </button>
        ) : (
          <>
            <input
              className="w-full rounded-lg bg-panel border border-slate-600 px-4 py-3 text-sm font-mono"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              onClick={verify}
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50"
            >
              Verify & sign in
            </button>
          </>
        )}
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>
    </main>
  );
}
