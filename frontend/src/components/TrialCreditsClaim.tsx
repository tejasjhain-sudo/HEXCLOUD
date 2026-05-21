import React, { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Fingerprint, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { api, isApiError } from '../lib/api';
import { openRazorpayCheckout } from '../lib/payments';
import { useStore } from '../store/useStore';
import { formatInr } from '../lib/vpsPricing';
import type { TrialVerificationState } from '../lib/api';

const STEPS = [
  { id: 1, title: 'Aadhaar', desc: 'Verify identity with OTP' },
  { id: 2, title: 'Pay ₹5', desc: 'One-time verification fee' },
  { id: 3, title: 'Credits', desc: '₹10,000 for 2 hours' },
];

export const TrialCreditsClaim: React.FC = () => {
  const token = useStore((s) => s.token);
  const user = useStore((s) => s.user);
  const fetchProfile = useStore((s) => s.fetchProfile);
  const setError = useStore((s) => s.setError);

  const [status, setStatus] = useState<TrialVerificationState | null>(null);
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [masked, setMasked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const loadStatus = async () => {
    if (!token) return;
    try {
      const s = await api.trial.status(token);
      setStatus(s);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [token, user?.trialActive]);

  if (!token || !user || user.role === 'ADMIN' || user.trialActive) return null;

  const step = status?.step ?? 1;
  const trialExpired = status?.trialExpired;

  if (trialExpired) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Your 2-hour testing window has ended. Add credits in Billing to deploy more VPS instances.
      </div>
    );
  }

  const handleSendOtp = async () => {
    setLocalMsg(null);
    setLoading(true);
    try {
      const res = await api.trial.sendAadhaarOtp(token, aadhaar);
      setMasked(res.maskedAadhaar);
      setLocalMsg(`OTP sent. Demo code: ${res.demoOtp}`);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLocalMsg(null);
    setLoading(true);
    try {
      await api.trial.verifyAadhaarOtp(token, otp);
      setLocalMsg('Aadhaar verified. Proceed to pay ₹5.');
      await loadStatus();
      await fetchProfile();
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLocalMsg(null);
    setLoading(true);
    try {
      const order = await api.trial.createVerificationPayment(token);
      await openRazorpayCheckout(
        order.orderId,
        order.amount,
        user.email,
        async (paymentId) => {
          try {
            const done = await api.trial.complete(token, {
              orderId: order.orderId,
              paymentId,
            });
            setLocalMsg(done.message);
            await loadStatus();
            await fetchProfile();
          } catch (err) {
            setError(isApiError(err) ? err.message : 'Could not activate credits');
          } finally {
            setLoading(false);
          }
        },
      );
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-indigo-600 p-2.5 text-white shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Claim ₹10,000 testing credits</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Complete identity verification, pay a one-time ₹5 fee, and get 2 hours of sandbox VPS credits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`rounded-xl px-3 py-2 border text-center ${
              step >= s.id
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-slate-200 bg-white/80'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Step {s.id}</p>
            <p className="text-xs font-extrabold text-slate-900">{s.title}</p>
          </div>
        ))}
      </div>

      {localMsg && (
        <p className="text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
          {localMsg}
        </p>
      )}

      {step === 1 && (
        <div className="space-y-3 bg-white/80 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Fingerprint className="h-4 w-4 text-indigo-600" />
            Link Aadhaar to your account
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={14}
            placeholder="12-digit Aadhaar number"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono"
          />
          <button
            type="button"
            disabled={loading || aadhaar.length !== 12}
            onClick={handleSendOtp}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send OTP to registered mobile'}
          </button>
          {masked && (
            <>
              <p className="text-xs text-slate-500">Linked: {masked}</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono"
              />
              <button
                type="button"
                disabled={loading || otp.length !== 6}
                onClick={handleVerifyOtp}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify Aadhaar
              </button>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 bg-white/80 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Aadhaar verified (•••• {status?.aadhaarLast4})
          </div>
          <p className="text-xs text-slate-600">
            Pay {formatInr(status?.verificationFeeInr ?? 5)} to confirm your identity. This is not wallet credit — it
            unlocks the one-time testing grant.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={handlePay}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pay ₹5 & activate credits
          </button>
        </div>
      )}

      {step >= 3 && !user.trialActive && (
        <p className="text-sm text-slate-600">Processing… refresh if credits do not appear.</p>
      )}
    </div>
  );
};
