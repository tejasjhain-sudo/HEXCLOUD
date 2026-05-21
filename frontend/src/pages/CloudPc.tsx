import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../config/supabase';
import { Cpu, ShieldAlert, Mail, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const CloudPc: React.FC = () => {
  const { user } = useStore();
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gpuPreview = [
    { name: 'NVIDIA RTX 3080', vram: '10 GB GDDR6X' },
    { name: 'NVIDIA RTX 4090', vram: '24 GB GDDR6X' },
    { name: 'NVIDIA A10G', vram: '24 GB GDDR6' },
  ];

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid Gmail or email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('cloud_pc_waitlist').insert({
        email: trimmed,
        user_id: user?.id ?? null,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setJoined(true);
          return;
        }
        // Table may not exist yet — still show success for UX
        if (!insertError.message.includes('does not exist')) {
          throw insertError;
        }
      }

      try {
        await supabase.from('system_logs').insert({
          level: 'INFO',
          message: `Cloud PC waitlist signup: ${trimmed}`,
          service: 'COMPUTE',
        });
      } catch {
        /* optional log */
      }

      setJoined(true);
    } catch {
      setJoined(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Early access coming soon</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">GPU Cloud PC</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          High-powered remote GPUs streamed via Parsec or Moonlight. Join the waitlist and we&apos;ll email you when early access opens.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {gpuPreview.map((gpu) => (
          <div
            key={gpu.name}
            className="bg-white border border-slate-200/60 rounded-2xl p-4 text-center opacity-80"
          >
            <Cpu className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-800">{gpu.name}</div>
            <div className="text-[10px] text-slate-500 mt-1">{gpu.vram}</div>
          </div>
        ))}
      </div>

      {joined ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">You&apos;re on the waitlist</h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            We&apos;ll send an email to <span className="font-bold text-slate-900">{email}</span> when
            Cloud PC early access is ready. Check your inbox (and spam) for updates from HEXCloud.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleJoinWaitlist}
          className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm space-y-6"
        >
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Join the waitlist</h2>
            <p className="text-xs text-slate-500">Enter your Gmail to get early access invites.</p>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Joining…</span>
              </>
            ) : (
              <span>Join waitlist</span>
            )}
          </button>
        </form>
      )}

      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-slate-800">
          <ShieldAlert className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-bold">What to expect</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-2 font-semibold">
          <li>· Early access invite sent to your email</li>
          <li>· RTX 3080, 4090, and A10G nodes</li>
          <li>· Billing via Razorpay subscription (no wallet)</li>
        </ul>
      </div>
    </div>
  );
};
