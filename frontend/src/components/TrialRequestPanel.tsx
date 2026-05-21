import React, { useState } from 'react';
import {
  Loader2,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Server,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatInr } from '../lib/vpsPricing';
import type { TrialRequest } from '../lib/api';

const OS_OPTIONS = [
  'Ubuntu 24.04 LTS',
  'Ubuntu 22.04 LTS',
  'Debian 12',
  'CentOS Stream 9',
  'Rocky Linux 9',
  'AlmaLinux 9',
  'Fedora 40',
  'Arch Linux',
];

export const TrialRequestPanel: React.FC = () => {
  const token = useStore((s) => s.token);
  const user = useStore((s) => s.user);
  const myTrialRequests = useStore((s) => s.myTrialRequests);
  const submitTrialRequest = useStore((s) => s.submitTrialRequest);
  const error = useStore((s) => s.error);
  const isLoading = useStore((s) => s.isLoading);

  const [fullName, setFullName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [osPreference, setOsPreference] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!token || !user || user.role === 'ADMIN') return null;

  // If user already has an active trial, don't show the form
  if (user.trialActive) return null;

  const latestRequest = myTrialRequests[0]; // sorted newest first
  const hasPending = latestRequest?.status === 'PENDING';
  const hasApproved = myTrialRequests.some((r) => r.status === 'APPROVED');
  const hasRejected = latestRequest?.status === 'REJECTED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTrialRequest({ fullName, purpose, osPreference, comments: comments || undefined });
    setSubmitted(true);
  };

  // Show pending status
  if (hasPending) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-amber-600 shrink-0 animate-pulse" />
          <div>
            <h2 className="text-lg font-black text-slate-900">Trial Request Pending</h2>
            <p className="text-sm text-slate-600 mt-1">
              Your VPS trial request is being reviewed by an admin. You'll get {formatInr(10000)} sandbox credits once approved.
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800 font-medium space-y-1">
          <p><span className="font-bold">Name:</span> {latestRequest.fullName}</p>
          <p><span className="font-bold">Purpose:</span> {latestRequest.purpose}</p>
          <p><span className="font-bold">OS:</span> {latestRequest.osPreference}</p>
          <p><span className="font-bold">Submitted:</span> {new Date(latestRequest.createdAt).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  // Show approved status (but trial not yet active — e.g. credits just granted)
  if (hasApproved && !user.trialActive) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h2 className="text-lg font-black text-slate-900">Trial Approved!</h2>
            <p className="text-sm text-slate-600 mt-1">
              Your VPS trial request has been approved. {formatInr(10000)} credits have been added to your wallet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show rejected status
  if (hasRejected && !hasApproved) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-red-50 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
          <div>
            <h2 className="text-lg font-black text-slate-900">Trial Request Rejected</h2>
            <p className="text-sm text-slate-600 mt-1">
              Your VPS trial request was not approved.
            </p>
            {latestRequest.adminNote && (
              <p className="text-xs text-rose-700 mt-2 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <span className="font-bold">Admin note:</span> {latestRequest.adminNote}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show the form (no existing pending/approved request)
  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-6 w-6 text-indigo-600 shrink-0" />
        <div>
          <h2 className="text-lg font-black text-slate-900">Request a Free VPS Trial</h2>
          <p className="text-sm text-slate-600 mt-1">
            Fill out this form to request a 2-hour VPS trial with {formatInr(10000)} sandbox credits.
            An admin will review and approve your request.
          </p>
        </div>
      </div>

      {submitted && !error ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 font-semibold">
          Trial request submitted successfully! Please wait for admin review.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">What will you use the VPS for? *</label>
            <textarea
              required
              minLength={10}
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="E.g., I want to deploy a Node.js web application and test it..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
            />
          </div>

          {/* OS Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred OS *</label>
            <div className="relative">
              <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                required
                value={osPreference}
                onChange={(e) => setOsPreference(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 appearance-none"
              >
                <option value="">Select an OS</option>
                {OS_OPTIONS.map((os) => (
                  <option key={os} value={os}>{os}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Additional comments (optional)</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Anything else you'd like us to know..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Trial Request
          </button>
        </form>
      )}
    </div>
  );
};
