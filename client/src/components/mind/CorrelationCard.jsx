import React from 'react';
import { Link2 } from 'lucide-react';

const ROWS = [
  { key: 'stressVsSeverity', label: 'Stress → skin severity', hint: 'positive = more stress, worse skin' },
  { key: 'moodVsSeverity', label: 'Mood → skin severity', hint: 'negative = lower mood, worse skin' },
  { key: 'sleepVsSeverity', label: 'Sleep → skin severity', hint: 'negative = less sleep, worse skin' }
];

const STRENGTH_COLOR = { strong: '#B98CE8', moderate: '#F2C98A', weak: '#A9C1CC', none: '#E2E8F0' };

function CorrelationBar({ r, strength }) {
  if (r === null || r === undefined) return <span className="text-[11px] text-[#8A9AA0]">Not enough data</span>;
  const width = Math.min(Math.abs(r), 1) * 50;
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 h-2 bg-slate-100 rounded-full">
        <div className="absolute top-0 bottom-0 w-px bg-slate-300 left-1/2" />
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{ width: `${width}%`, left: r >= 0 ? '50%' : `${50 - width}%`, backgroundColor: STRENGTH_COLOR[strength] || '#A9C1CC' }}
        />
      </div>
      <span className="text-[11px] font-bold w-12 text-right">{r.toFixed(2)}</span>
      <span className="text-[10px] text-[#8A9AA0] w-16 capitalize">{strength}</span>
    </div>
  );
}

/** How mood, stress and sleep in the week before each scan relate to its severity. */
export function CorrelationCard({ correlations }) {
  return (
    <div className="solid-card space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-[#3F5F4A]" />
        <div>
          <h3 className="text-sm font-semibold">Mind ↔ skin connection</h3>
          <p className="text-[11px] text-[#8A9AA0]">
            Pearson correlation between the {correlations?.windowDays ?? 7} days before each scan and its severity
          </p>
        </div>
      </div>
      {ROWS.map((row) => (
        <div key={row.key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium">{row.label}</span>
            <span className="text-[10px] text-[#8A9AA0]">{row.hint}</span>
          </div>
          <CorrelationBar {...(correlations?.[row.key] || {})} />
        </div>
      ))}
      <ul className="space-y-1 pt-1 border-t border-slate-100">
        {(correlations?.findings || []).map((f) => (
          <li key={f} className="text-[11px] text-[#1F2A2E]">• {f}</li>
        ))}
      </ul>
    </div>
  );
}
