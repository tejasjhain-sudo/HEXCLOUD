import React, { useState } from 'react';
import { Shield, Receipt, MessageCircle, Loader2 } from 'lucide-react';

interface BillingTrustBarProps {
  onOpenTicket: (subject: string, message: string) => Promise<void>;
  isLoading?: boolean;
}

export const BillingTrustBar: React.FC<BillingTrustBarProps> = ({ onOpenTicket, isLoading }) => {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-2 text-xs text-slate-600">
        <Receipt className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800">GST (18%)</strong> is applied on all taxable invoices as per Indian regulations.
          Line items show subtotal + GST separately on PDF downloads.
        </p>
      </div>
      <div className="flex items-start gap-2 text-xs text-slate-600">
        <Shield className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          <a
            href="https://hexcloud.com/refund-policy"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-indigo-600 hover:underline"
          >
            Refund policy
          </a>
          {' '}— Pro-rated refunds for failed provisioning within 24h. Subscription downgrades apply next cycle.
        </p>
      </div>

      {!ticketOpen ? (
        <button
          type="button"
          onClick={() => setTicketOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-indigo-700 hover:text-indigo-800"
        >
          <MessageCircle className="h-4 w-4" />
          Open billing support ticket
        </button>
      ) : ticketSent ? (
        <p className="text-xs font-bold text-emerald-700">Ticket submitted. Our billing team will reply by email.</p>
      ) : (
        <div className="space-y-2">
          <textarea
            value={ticketMsg}
            onChange={(e) => setTicketMsg(e.target.value)}
            placeholder="Describe your billing issue (invoice, charge, GST, refund)..."
            className="w-full h-20 px-3 py-2 border border-slate-200 rounded-xl text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isLoading || !ticketMsg.trim()}
              onClick={async () => {
                await onOpenTicket('Billing inquiry', ticketMsg.trim());
                setTicketSent(true);
                setTicketOpen(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-1"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Submit ticket
            </button>
            <button type="button" onClick={() => setTicketOpen(false)} className="text-xs font-bold text-slate-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
