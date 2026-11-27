import React, { useState } from 'react';
import { X, SlidersHorizontal, ArrowLeftRight, CheckCircle2, TrendingDown } from 'lucide-react';

export default function CompareModal({ isOpen, onClose, scans }) {
  const [sliderPos, setSliderPos] = useState(50);
  const scanA = scans[1] || scans[0]; // Previous scan
  const scanB = scans[0]; // Latest scan

  if (!isOpen || !scanA || !scanB) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/70 rounded-[28px] max-w-2xl w-full p-6 shadow-2xl relative text-[#1F2A2E]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#B98CE8]/20 text-[#6B3FA0] flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#1F2A2E]">Side-by-Side Lesion Comparison</h3>
            <p className="text-xs text-[#8A9AA0]">Slide between Baseline ({scanA.date}) and Latest ({scanB.date})</p>
          </div>
        </div>

        {/* Interactive Split View */}
        <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-inner border border-slate-200 select-none">
          {/* Scan B (Latest - Background) */}
          <img
            src={scanB.imageUrl}
            alt="Current Scan"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
            Latest: {scanB.date} ({scanB.severityScore}/100)
          </div>

          {/* Scan A (Previous - Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={scanA.imageUrl}
              alt="Previous Scan"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '100%', minWidth: '100%' }}
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
              Previous: {scanA.date} ({scanA.severityScore}/100)
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center -translate-x-1/2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#3F5F4A]" />
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            aria-label="Comparison slider position"
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
          />
        </div>

        {/* Metrics Difference Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">Redness Delta</div>
            <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> -{scanA.rednessIndex - scanB.rednessIndex}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{scanA.rednessIndex}% → {scanB.rednessIndex}%</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">Area Delta</div>
            <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> -{(scanA.areaCm2 - scanB.areaCm2).toFixed(1)} cm²
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{scanA.areaCm2} cm² → {scanB.areaCm2} cm²</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">Overall Severity</div>
            <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> -{scanA.severityScore - scanB.severityScore} pts
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Mild resolving status</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#DCEBE8]/40 border border-[#A9C1CC]/40 rounded-xl text-xs text-[#1F2A2E]">
          <strong>AI Differential Observation:</strong> Reduced peripheral capillary dilation and gradual restoration of stratified stratum corneum. Continue prescribed barrier regimen.
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-[#0F3B3F] hover:bg-[#1F6A66] rounded-xl transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
