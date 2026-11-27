import React from 'react';
import { AlertTriangle, LifeBuoy, Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-xs text-[#8A9AA0] py-6 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-6 px-4 h-full">
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-[#DCEBE8] text-[#3F5F4A] flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="text-sm font-semibold text-[#1F2A2E]">{title}</div>
      {children && <p className="text-[11px] text-[#8A9AA0] max-w-xs">{children}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{error.message || String(error)}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline cursor-pointer">
          Retry
        </button>
      )}
    </div>
  );
}

/** Crisis-support resources returned by the API when risk language is detected. */
export function SafetyNotice({ resources }) {
  if (!resources) return null;
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-900 space-y-1.5">
      <div className="flex items-center gap-1.5 font-semibold">
        <LifeBuoy className="w-3.5 h-3.5" /> You don't have to go through this alone
      </div>
      <p>{resources.message}</p>
      <ul className="space-y-0.5">
        {resources.helplines.map((h) => (
          <li key={h.name}>
            <strong>{h.name}</strong> ({h.region}): {h.contact}
          </li>
        ))}
      </ul>
    </div>
  );
}
