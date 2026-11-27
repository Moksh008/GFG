import React from 'react';
import { AlertCircle } from 'lucide-react';
import { TONE_BADGE, signed, statusTone } from '../../utils/format';

function Delta({ value, unit = '' }) {
  if (!value) return null;
  return (
    <span className={`${value < 0 ? 'text-emerald-600' : 'text-amber-600'} text-xs ml-1`}>
      {value < 0 ? '↓' : '↑'} {Math.abs(value)}
      {unit}
    </span>
  );
}

function Metric({ label, children }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
      <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">{label}</div>
      <div className="text-base font-bold text-[#1F2A2E] mt-0.5">{children}</div>
    </div>
  );
}

export function ProbabilityBars({ probabilities }) {
  const sorted = Object.entries(probabilities || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
      <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">Model probabilities</div>
      {sorted.map(([label, p]) => (
        <div key={label} className="flex items-center gap-2 text-[11px]">
          <span className="w-16 capitalize text-[#1F2A2E]">{label}</span>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#1F6A66]" style={{ width: `${(p * 100).toFixed(1)}%` }} />
          </div>
          <span className="w-12 text-right text-[#647C7C]">{(p * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

/** Headline, measurements, probabilities and photo-quality warnings for one scan. */
export function ScanResult({ scan }) {
  const impr = scan.improvement;
  const tone = statusTone(scan.status, scan.condition);
  const warnings = scan.quality?.warnings || [];

  return (
    <div className="space-y-3">
      <div className={`border rounded-2xl p-4 ${TONE_BADGE[tone]}`}>
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{scan.status}</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/70 border border-current/20">
            Severity {scan.severityScore}/100{impr ? ` (${signed(impr.severityDelta)})` : ''}
          </span>
        </div>
        <p className="text-sm font-semibold">{scan.conditionDisplay}</p>
        <p className="text-xs opacity-80 mt-1">{impr?.analysis || scan.aiSummary}</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Metric label="Redness">
          {scan.rednessIndex}%<Delta value={impr?.rednessDelta} unit="%" />
        </Metric>
        <Metric label="Est. area">
          {scan.areaCm2} cm²<Delta value={impr?.areaDeltaCm2} />
        </Metric>
        <Metric label="Symmetry">{scan.symmetryScore}%</Metric>
      </div>

      <ProbabilityBars probabilities={scan.probabilities} />

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-xl p-3 space-y-0.5">
          {warnings.map((w) => (
            <div key={w} className="flex gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
