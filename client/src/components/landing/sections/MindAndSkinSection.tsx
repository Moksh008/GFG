import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Zap, Smile, Droplets, Info, Activity, ArrowUpRight } from 'lucide-react';

interface VariableMeta {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  correlation: string;
  dataPoints: number[];
}

export const MindAndSkinSection: React.FC = () => {
  const [selectedVar, setSelectedVar] = useState<string>('stress');
  const [, setHoveredDay] = useState<number | null>(null);

  const variables: VariableMeta[] = [
    {
      id: 'stress',
      label: 'Perceived stress',
      icon: <Zap className="w-4 h-4" />,
      color: '#EA580C',
      bgColor: '#FFEDD5',
      description: 'Daily emotional and cognitive tension recorded on a 1-10 clinical scale.',
      correlation: 'Positive association: 78% of flare-ups coincided with 48h sustained stress spikes.',
      dataPoints: [3, 4, 3, 5, 8, 9, 8, 6, 4, 3, 2, 4, 7, 8, 6],
    },
    {
      id: 'sleep',
      label: 'Deep sleep hours',
      icon: <Moon className="w-4 h-4" />,
      color: '#4F46E5',
      bgColor: '#E0E7FF',
      description: 'Continuous sleep duration and slow-wave restorative phase quality.',
      correlation: 'Inverse association: Sub-6h sleep cycles were tracked prior to 65% of redness increases.',
      dataPoints: [7.5, 7.2, 8.0, 6.5, 4.8, 5.0, 5.2, 6.8, 7.4, 7.8, 8.2, 6.9, 5.1, 5.5, 7.0],
    },
    {
      id: 'mood',
      label: 'Emotional wellbeing',
      icon: <Smile className="w-4 h-4" />,
      color: '#E11D48',
      bgColor: '#FFE4E6',
      description: 'Self-reported subjective contentment and psychological ease.',
      correlation: 'Observed alignment: Steady mood scores consistently co-occurred with baseline barrier stability.',
      dataPoints: [8, 8, 7, 6, 4, 3, 4, 6, 7, 8, 9, 7, 4, 5, 7],
    },
    {
      id: 'hydration',
      label: 'Hydration & habits',
      icon: <Droplets className="w-4 h-4" />,
      color: '#0D9488',
      bgColor: '#CCFBF1',
      description: 'Water intake, barrier humectant application, and ambient humidity levels.',
      correlation: 'Protective correlation: Consistent hydration buffers against environmental dryness triggers.',
      dataPoints: [2.5, 2.8, 2.6, 2.2, 1.4, 1.6, 1.8, 2.4, 2.7, 3.0, 2.9, 2.3, 1.5, 2.0, 2.8],
    },
  ];

  const currentVar = variables.find((v) => v.id === selectedVar) || variables[0];

  return (
    <section id="mind-skin" className="relative py-24 px-6 lg:px-12 bg-[#FAF8F4] border-t border-slate-200/60 overflow-hidden">
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs mb-3">
            <span className="text-[10px] font-mono font-medium text-teal-700">[ + ] Systemic correlation</span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-xs text-slate-600">Mind & barrier research</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-medium text-[#193653] tracking-tight leading-tight mb-4">
            Connecting emotional rhythm with barrier responses
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Skin is a neuro-immunological mirror. Dermora uncovers objective associations between daily emotional pressure, sleep architecture, and symptom fluctuations.
          </p>

          <div className="mt-3.5 inline-flex items-center space-x-1.5 text-xs text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Observational trend correlation, not diagnostic medical causation</span>
          </div>
        </div>

        {/* Interactive Correlation Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Variable Selectors (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-left mb-1.5">
              <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wide">
                Tracked parameter
              </span>
            </div>

            {variables.map((v) => {
              const isSelected = selectedVar === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVar(v.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white shadow-sm border-slate-300 ring-1 ring-slate-300'
                      : 'bg-white/70 hover:bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                        style={{ backgroundColor: v.bgColor, color: v.color }}
                      >
                        {v.icon}
                      </div>
                      <span className="text-xs font-medium text-[#193653]">{v.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/80">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-10">{v.description}</p>
                </button>
              );
            })}

            {/* Correlation Insight Card */}
            <div className="p-3.5 rounded-xl bg-white text-left border border-slate-200 shadow-2xs mt-3">
              <div className="flex items-center space-x-2 text-xs font-medium text-[#193653] mb-1">
                <Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>Correlation summary</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentVar.correlation}
              </p>
            </div>
          </div>

          {/* Right: Comparative Dual-Trajectory Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl p-5 shadow-sm border border-slate-200 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-medium text-[#193653]">
                  15-day synchronous tracking curve
                </h3>
                <p className="text-xs text-slate-500">Skin reactivity vs. {currentVar.label}</p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: currentVar.color }} />
                  <span className="text-slate-700">{currentVar.label}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#193653]" />
                  <span className="text-slate-700">Reactivity index</span>
                </div>
              </div>
            </div>

            {/* SVG Trajectory Graph */}
            <div className="relative w-full h-60 mt-4 pt-2">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Horizontal Guide Grid */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                {/* 1. Skin Reactivity Curve */}
                <path
                  d="M 20 160 Q 80 150, 140 160 T 260 80 T 380 140 T 500 70 T 580 130"
                  stroke="#193653"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* 2. Tracked Lifestyle Variable Curve */}
                <path
                  d="M 20 140 Q 80 130, 140 140 T 260 60 T 380 150 T 500 55 T 580 120"
                  stroke={currentVar.color}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Interactive Points along trajectory */}
                {[
                  { x: 20, day: 1 },
                  { x: 140, day: 4 },
                  { x: 260, day: 7 },
                  { x: 380, day: 10 },
                  { x: 500, day: 13 },
                  { x: 580, day: 15 },
                ].map((pt, i) => (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDay(pt.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <circle cx={pt.x} cy="80" r="3.5" fill="#FFFFFF" stroke="#193653" strokeWidth="2" />
                    <circle cx={pt.x} cy="60" r="3.5" fill="#FFFFFF" stroke={currentVar.color} strokeWidth="2" />
                  </g>
                ))}
              </svg>
            </div>

            {/* X-Axis Day Labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-100">
              <span>Day 1</span>
              <span>Day 4</span>
              <span className="text-[#193653] font-medium">Day 7 (Stress spike)</span>
              <span>Day 10</span>
              <span className="text-teal-700 font-medium">Day 13 (Reaction)</span>
              <span>Day 15</span>
            </div>

            {/* Summary Footnote */}
            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>
                Skin flare reaction follows approximately 24 to 48 hours after sustained lifestyle curve spikes.
              </span>
              <span className="font-mono text-xs text-teal-800 flex items-center space-x-1 flex-shrink-0 ml-3">
                <span>Lag: ~36h</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
