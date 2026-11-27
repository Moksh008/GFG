import React, { useState } from 'react';
import { ArrowLeftRight, SlidersHorizontal, TrendingDown, TrendingUp } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { buttonClass } from '../ui/classes';

function DeltaTile({ label, delta, from, to, unit }) {
  const better = delta <= 0;
  const Icon = better ? TrendingDown : TrendingUp;
  return (
    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
      <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">{label}</div>
      <div className={`text-sm font-bold flex items-center justify-center gap-1 mt-0.5 ${better ? 'text-emerald-600' : 'text-amber-600'}`}>
        <Icon className="w-3.5 h-3.5" /> {delta > 0 ? '+' : ''}
        {Number.isInteger(delta) ? delta : delta.toFixed(1)}
        {unit}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5">
        {from}
        {unit} → {to}
        {unit}
      </div>
    </div>
  );
}

/** Before/after slider for a comparison returned by GET /skin/compare. */
export default function CompareModal({ isOpen, onClose, comparison }) {
  const [split, setSplit] = useState(50);
  if (!comparison) return null;
  const { baseline: before, current: after, improvement } = comparison;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      icon={ArrowLeftRight}
      iconClass="bg-[#B98CE8]/20 text-[#6B3FA0]"
      title="Side-by-side comparison"
      subtitle={`${after.bodyArea} · ${before.date} → ${after.date} (${improvement.daysBetween} days)`}
    >
      <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-inner border border-slate-200 select-none">
        <img src={after.imageUrl} alt="Latest scan" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
          Latest: {after.date} ({after.severityScore}/100)
        </div>

        <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
          <img src={before.imageUrl} alt="Earlier scan" className="absolute inset-0 h-full object-cover max-w-none" style={{ width: `${10000 / Math.max(split, 1)}%` }} />
          <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
            Before: {before.date} ({before.severityScore}/100)
          </div>
        </div>

        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none" style={{ left: `${split}%` }}>
          <div className="w-7 h-7 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center -translate-x-1/2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3F5F4A]" />
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label="Comparison slider"
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <DeltaTile label="Redness" delta={improvement.rednessDelta} from={before.rednessIndex} to={after.rednessIndex} unit="%" />
        <DeltaTile label="Est. area" delta={improvement.areaDeltaCm2} from={before.areaCm2} to={after.areaCm2} unit=" cm²" />
        <DeltaTile label="Severity" delta={improvement.severityDelta} from={before.severityScore} to={after.severityScore} unit="" />
      </div>

      <div className="mt-4 p-3 bg-[#DCEBE8]/40 border border-[#A9C1CC]/40 rounded-xl text-xs text-[#1F2A2E]">
        <strong>AI progress analysis:</strong> {improvement.analysis}
      </div>

      <div className="flex justify-end mt-4">
        <button type="button" onClick={onClose} className={buttonClass.primary}>Close</button>
      </div>
    </Modal>
  );
}
