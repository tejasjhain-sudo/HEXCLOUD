import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
  FileText,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useStore } from '../../store/useStore';
import type { AdminTrialRequest } from '../../lib/api';

export const AdminTrialRequestsPage: React.FC = () => {
  const adminTrialRequests = useStore((s) => s.adminTrialRequests);
  const fetchAdminTrialRequests = useStore((s) => s.fetchAdminTrialRequests);
  const approveTrialRequest = useStore((s) => s.approveTrialRequest);
  const rejectTrialRequest = useStore((s) => s.rejectTrialRequest);

  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminTrialRequests();
  }, [fetchAdminTrialRequests]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return adminTrialRequests;
    return adminTrialRequests.filter((r) => r.status === statusFilter);
  }, [adminTrialRequests, statusFilter]);

  const pendingCount = adminTrialRequests.filter((r) => r.status === 'PENDING').length;

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await approveTrialRequest(id, adminNote[id] || undefined);
    setActionLoading(null);
    setAdminNote((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    await rejectTrialRequest(id, adminNote[id] || undefined);
    setActionLoading(null);
    setAdminNote((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const statusColor: Record<string, string> = {
    PENDING: 'text-amber-400',
    APPROVED: 'text-emerald-400',
    REJECTED: 'text-rose-400',
    EXPIRED: 'text-slate-500',
  };

  const statusIcon: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3.5 w-3.5 text-amber-400" />,
    APPROVED: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
    REJECTED: <XCircle className="h-3.5 w-3.5 text-rose-400" />,
    EXPIRED: <Clock className="h-3.5 w-3.5 text-slate-500" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-cyan-400" />
            Trial Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve/reject VPS trial requests from users.
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-400 font-bold">{pendingCount} pending</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['PENDING', 'APPROVED', 'REJECTED', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === s
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {s === 'all' ? 'All' : s}
            {s === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard padding="lg">
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No trial requests found.</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <GlassCard key={req.id} padding="lg">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: Request details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-white text-sm">{req.fullName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{req.userEmail}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${statusColor[req.status] || 'text-slate-400'}`}>
                      {statusIcon[req.status]}
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Purpose</span>
                      <p className="text-slate-300 mt-0.5">{req.purpose}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">OS Preference</span>
                        <p className="text-cyan-400 font-semibold mt-0.5">{req.osPreference}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Submitted</span>
                        <p className="text-slate-300 mt-0.5">{new Date(req.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {req.comments && (
                      <div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Comments</span>
                        <p className="text-slate-400 mt-0.5 text-xs">{req.comments}</p>
                      </div>
                    )}
                    {req.adminNote && req.status !== 'PENDING' && (
                      <div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Admin Note</span>
                        <p className="text-slate-300 mt-0.5 text-xs">{req.adminNote}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions (only for PENDING) */}
                {req.status === 'PENDING' && (
                  <div className="space-y-3 lg:w-72 shrink-0">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        Admin Note
                      </label>
                      <textarea
                        rows={2}
                        value={adminNote[req.id] || ''}
                        onChange={(e) => setAdminNote((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        placeholder="Optional note for the user..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex-1 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                      >
                        {actionLoading === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex-1 py-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                      >
                        {actionLoading === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
