import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function LesionChangeCard({ onOpenCompare }) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mainPoints = [
    { x: 20, y: 70, val: '0.42' },
    { x: 70, y: 60, val: '0.38' },
    { x: 120, y: 75, val: '0.45' },
    { x: 170, y: 38, val: '0.22' },
    { x: 220, y: 28, val: '0.18' },
    { x: 270, y: 42, val: '0.26' },
    { x: 310, y: 22, val: '0.14' }
  ];

  const mainPath = mainPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const ghostPath = mainPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y + 10}`).join(' ');

  const ticks = Array.from({ length: 24 }).map((_, i) => {
    const angle = 180 + (i / 23) * 180;
    const rad = (angle * Math.PI) / 180;
    const cx = 50;
    const cy = 50;
    const r1 = 34;
    const r2 = 42;
    return {
      x1: cx + r1 * Math.cos(rad),
      y1: cy + r1 * Math.sin(rad),
      x2: cx + r2 * Math.cos(rad),
      y2: cy + r2 * Math.sin(rad),
      active: i < 16
    };
  });

  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Lesion Morphology Delta</h3>
            <p className="text-[11px] text-[#8A9AA0] font-medium">Longitudinal size & redness change</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#2FBF71]/15 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#2FBF71]" />
            <span className="text-xs font-bold text-[#2FBF71]">+0.34</span>
            <span className="text-[10px] text-[#2FBF71] font-semibold">Clearance</span>
          </div>
        </div>

        {/* 110px Line Chart without outer box */}
        <div className="mt-2 relative">
          <svg viewBox="0 0 330 85" className="w-full h-[80px] overflow-visible">
            <path
              d={ghostPath}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <path
              d={mainPath}
              fill="none"
              stroke="#1F2A2E"
              strokeWidth="1.5"
            />
            {mainPoints.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3"
                className="fill-[#1F2A2E] stroke-white stroke-2 hover:r-4 transition-all"
              />
            ))}
          </svg>

          <div className="flex justify-between text-[10px] text-[#8A9AA0] px-1 font-semibold -mt-1">
            {weekDays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Row */}
      <div className="flex items-center gap-2 py-1 px-1">
        <div className="w-5 h-5 rounded-full bg-[#3F5F4A]/15 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-[#3F5F4A]">AI</span>
        </div>
        <p className="text-[11px] text-[#1F2A2E] truncate font-semibold">
          Vascular blush reduced by 14% since Wednesday’s dose.
        </p>
        <button
          onClick={onOpenCompare}
          className="ml-auto text-[11px] font-bold text-[#0F3B3F] hover:underline shrink-0 cursor-pointer"
        >
          Compare
        </button>
      </div>

      {/* 2 sub-sections */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
        <div className="flex flex-col justify-between py-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8A9AA0]">Redness</span>
            <span className="text-[11px] font-bold text-[#2FBF71]">-8%</span>
          </div>
          <div className="flex items-end justify-between px-2 h-12 pt-1">
            <div className="flex flex-col items-center">
              <div className="w-5 bg-[#F2C98A] rounded-t-sm h-7" />
              <span className="text-[9px] text-[#8A9AA0] mt-1 font-semibold">Oct</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-5 bg-[#B98CE8] rounded-t-sm h-9" />
              <span className="text-[9px] text-[#8A9AA0] mt-1 font-semibold">Nov</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-5 bg-[#3F5F4A] rounded-t-sm h-5" />
              <span className="text-[9px] text-[#8A9AA0] mt-1 font-semibold">Dec</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between py-1 pl-2 border-l border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8A9AA0]">Area (cm²)</span>
            <span className="text-[11px] font-bold text-[#2FBF71]">-5%</span>
          </div>

          <div className="relative flex items-center justify-center h-12">
            <svg viewBox="0 0 100 60" className="w-24 h-12">
              {ticks.map((t, idx) => (
                <line
                  key={idx}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.active ? '#3F5F4A' : '#E2E8F0'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <div className="absolute top-4 text-center leading-tight">
              <div className="text-xs font-bold text-[#1F2A2E]">1.8</div>
              <div className="text-[8px] text-[#8A9AA0] font-semibold">cm²</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
