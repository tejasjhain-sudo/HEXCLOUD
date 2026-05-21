import React, { useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useStore } from '../../store/useStore';
import type { SupportTicket } from '../../types/billing';

export const AdminTicketsPage: React.FC = () => {
  const { adminTickets, updateTicket } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const tickets = adminTickets.length
    ? adminTickets
    : [
        {
          id: 't1',
          userId: 'u1',
          userEmail: 'alex@acme.io',
          subject: 'Cannot SSH into VPS',
          message: 'Connection timed out on port 22 after instance restart.',
          status: 'OPEN' as const,
          priority: 'HIGH' as const,
          adminNotes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't2',
          userId: 'u2',
          userEmail: 'priya@startup.in',
          subject: 'Billing discrepancy',
          message: 'Charged twice for GPU session on May 18.',
          status: 'IN_PROGRESS' as const,
          priority: 'MEDIUM' as const,
          adminNotes: 'Checking Razorpay webhook',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

  const selectedTicket = tickets.find((t) => t.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <p className="text-sm text-slate-500 mt-1">Customer support workflow for Admin &amp; Support roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard padding="lg" className="max-h-[560px] overflow-y-auto">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-cyan-400" /> Queue ({tickets.length})
          </h2>
          <div className="space-y-2">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelected(t.id); setNotes(t.adminNotes ?? ''); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected === t.id ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-white text-sm">{t.subject}</span>
                  <StatusBadge status={t.priority} />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{t.userEmail} · <StatusBadge status={t.status} /></div>
              </button>
            ))}
          </div>
        </GlassCard>

        {selectedTicket ? (
          <GlassCard padding="lg">
            <h3 className="font-bold text-white text-lg">{selectedTicket.subject}</h3>
            <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{selectedTicket.message}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as SupportTicket['status'][]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateTicket(selectedTicket.id, { status: s })}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
                    selectedTicket.status === s ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'border-white/10 text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-4 h-28 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
              placeholder="Admin notes…"
            />
            <button
              onClick={() => updateTicket(selectedTicket.id, { adminNotes: notes })}
              className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500"
            >
              Save notes
            </button>
          </GlassCard>
        ) : (
          <GlassCard padding="lg" className="flex items-center justify-center text-slate-500 text-sm">
            Select a ticket to view details
          </GlassCard>
        )}
      </div>
    </div>
  );
};
