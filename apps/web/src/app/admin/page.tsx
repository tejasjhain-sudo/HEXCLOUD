'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('hex_token');
    if (!token) return;
    api<Record<string, unknown>>('/api/v2/admin/overview', { token })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-400">
        ← Dashboard
      </Link>
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="text-slate-400 text-sm">Users · trials · abuse · VPS · audit logs</p>
      {error && <p className="text-rose-400">{error}</p>}
      <pre className="rounded-xl bg-surface border border-slate-700 p-4 text-xs overflow-auto max-h-[70vh]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
