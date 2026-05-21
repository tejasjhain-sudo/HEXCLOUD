import React from 'react';
import { Download, FileText } from 'lucide-react';
import type { InvoiceLineItem } from '../../lib/billingUtils';

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
};

interface InvoiceHistoryTableProps {
  invoices: InvoiceLineItem[];
  onDownload: (inv: InvoiceLineItem) => void;
}

export const InvoiceHistoryTable: React.FC<InvoiceHistoryTableProps> = ({ invoices, onDownload }) => {
  if (invoices.length === 0) {
    return (
      <p className="text-center py-12 text-slate-400 text-sm">No invoices yet. Subscribe via Razorpay to generate one.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/60">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50">
          <tr className="text-slate-500 border-b border-slate-200">
            <th className="px-4 py-3 font-semibold">Invoice</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Subtotal</th>
            <th className="px-4 py-3 font-semibold">GST (18%)</th>
            <th className="px-4 py-3 font-semibold">Total</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">PDF</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-bold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  {inv.invoiceNumber}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="px-4 py-3 font-mono">₹{inv.subtotalInr.toFixed(2)}</td>
              <td className="px-4 py-3 font-mono text-slate-500">₹{inv.gstInr.toFixed(2)}</td>
              <td className="px-4 py-3 font-mono font-bold text-slate-900">₹{inv.totalInr.toFixed(2)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${STATUS_STYLES[inv.status]}`}>
                  {inv.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDownload(inv)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 font-bold"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
