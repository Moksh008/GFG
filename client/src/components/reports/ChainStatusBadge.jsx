import React from 'react';
import { AlertTriangle, CircleDashed, Loader2, ShieldCheck } from 'lucide-react';

const STYLES = {
  anchored: { icon: ShieldCheck, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'On-chain' },
  pending: { icon: Loader2, cls: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Recording…', spin: true },
  failed: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Retrying' },
  off: { icon: CircleDashed, cls: 'bg-slate-50 text-slate-600 border-slate-200', label: 'Fingerprint saved' }
};

/** Status pill for a report's blockchain anchoring. */
export function ChainStatusBadge({ status, title }) {
  const s = STYLES[status] || STYLES.off;
  const Icon = s.icon;
  return (
    <span title={title} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      <Icon className={`w-3 h-3 ${s.spin ? 'animate-spin' : ''}`} /> {s.label}
    </span>
  );
}
