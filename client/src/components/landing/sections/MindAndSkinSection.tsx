import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Zap, Smile, Droplets, Info, Sparkles, ArrowUpRight } from 'lucide-react';


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
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const variables: VariableMeta[] = [
    {
      id: 'stress',
      label: 'Perceived Stress',
      icon: <Zap className="w-4 h-4" />,
      color: '#EA580C',
      bgColor: '#FFEDD5',
      description: 'Daily emotional and cognitive tension rating recorded on a 1-10 clinical scale.',
      correlation: 'Positive association: 78% of flare-ups coincided with 48h sustained stress spikes.',
      dataPoints: [3, 4, 3, 5, 8, 9, 8, 6, 4, 3, 2, 4, 7, 8, 6],
    },
    {
      id: 'sleep',
      label: 'Deep Sleep Hours',
      icon: <Moon className="w-4 h-4" />,
      color: '#4F46E5',
      bgColor: '#E0E7FF',
      description: 'Continuous sleep duration and slow-wave restorative phase quality.',
      correlation: 'Inverse association: Sub-6h sleep cycles were tracked prior to 65% of redness increases.',
      dataPoints: [7.5, 7.2, 8.0, 6.5, 4.8, 5.0, 5.2, 6.8, 7.4, 7.8, 8.2, 6.9, 5.1, 5.5, 7.0],
    },
    {
      id: 'mood',
      label: 'Emotional Wellbeing',
      icon: <Smile className="w-4 h-4" />,
      color: '#E11D48',
      bgColor: '#FFE4E6',
      description: 'Self-reported subjective contentment and psychological ease.',
      correlation: 'Observed alignment: Steady mood scores consistently co-occurred with baseline barrier stability.',
      dataPoints: [8, 8, 7, 6, 4, 3, 4, 6, 7, 8, 9, 7, 4, 5, 7],
    },
    {
      id: 'hydration',
      label: 'Hydration & Habits',
      icon: <Droplets className="w-4 h-4" />,
      color: '#0D9488',
      bgColor: '#CCFBF1',
      description: 'Water intake, barrier humectant application, and ambient humidity levels.',
      correlation: 'Protective correlation: Consistent hydration buffers against environmental dryness triggers.',
      dataPoints: [2.5, 2.8, 2.6, 2.2, 1.4, 1.6, 1.8, 2.4, 2.7, 3.0, 2.9, 2.3, 1.5, 2.0, 2.8],
    },
  ];

  const currentVar = variables.find((v) => v.id === selectedVar) || variables[0];

  // Skin flare index sample trajectory over the same 15 days
  const skinFlarePoints = [2, 2.5, 2, 3.5, 6.8, 8.2, 7.5, 5.0, 3.2, 2.0, 1.8, 3.0, 7.2, 7.8, 4.0];

  return (
    <section id="mind-skin" className="relative py-28 px-6 lg:px-12 bg-gradient-to-b from-[#F5ECE1] via-[#FAF8F4] to-[#FAF8F4] overflow-hidden">
      {/* Soft Ambient Radiance */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#DAD9F5]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#B8D0E4]/30 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-white shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              Mind & Skin Holistics
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-tight mb-5">
            Connecting emotional rhythm with{' '}
            <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#C4B5E0]/60 decoration-wavy">
              skin barrier responses.
            </span>
          </h2>

          <p className="text-base text-[#193653]/75 leading-relaxed font-normal">
            Your skin is a reactive neuro-immunological mirror. Dermora helps you uncover subtle personal associations between daily emotional pressure, sleep architecture, and symptom fluctuations.
          </p>

          {/* Scientific Disclaimer Pill */}
          <div className="mt-4 inline-flex items-center space-x-1.5 text-xs text-[#193653]/60 bg-white/60 px-4 py-1.5 rounded-full border border-white">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span>Displaying observational trend correlations, not diagnostic medical causation.</span>
          </div>
        </div>

        {/* Interactive Correlation Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Variable Selectors & Details (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="text-left mb-2">
              <span className="text-xs font-bold text-[#193653]/60 uppercase tracking-wider">
                Select Tracked Lifestyle Variable
              </span>
            </div>

            {variables.map((v) => {
              const isSelected = selectedVar === v.id;
              return (
                <motion.button
                  key={v.id}
                  onClick={() => setSelectedVar(v.id)}
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white shadow-lg border-white ring-2 ring-[#B8D0E4]'
                      : 'bg-white/60 hover:bg-white/90 border-white/60 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: v.bgColor, color: v.color }}
                      >
                        {v.icon}
                      </div>
                      <span className="text-sm font-extrabold text-[#193653]">{v.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        Active Plot
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#193653]/65 leading-relaxed pl-11">{v.description}</p>
                </motion.button>
              );
            })}

            {/* Correlation Insight Card */}
            <div className="p-4 rounded-2xl clay-card text-left mt-4 border border-white">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#193653] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Correlation Analysis</span>
              </div>
              <p className="text-xs text-[#193653]/80 leading-relaxed font-medium">
                {currentVar.correlation}
              </p>
            </div>
          </div>

          {/* Right: Comparative Dual-Trajectory Chart (7 cols) */}
          <div className="lg:col-span-7 clay-card rounded-3xl p-6 shadow-xl border border-white text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#193653]">
                  15-Day Synchronous Tracking Curve
                </h3>
                <p className="text-xs text-[#193653]/60">Comparing Skin Reactivity vs. {currentVar.label}</p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-4 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentVar.color }} />
                  <span className="text-[#193653]">{currentVar.label}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#8873B9]" />
                  <span className="text-[#193653]">Skin Reactivity</span>
                </div>
              </div>
            </div>

            {/* SVG Trajectory Graph */}
            <div className="relative w-full h-64 mt-6 pt-4">
              <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  {/* Grid lines */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="600" y2="0" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
                  </pattern>

                  {/* Gradient fill under Skin Reactivity curve */}
                  <linearGradient id="skinAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8873B9" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8873B9" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Variable curve glow */}
                  <linearGradient id="varGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={currentVar.color} />
                    <stop offset="100%" stopColor={currentVar.color} />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Grid */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="110" x2="600" y2="110" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="170" x2="600" y2="170" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />

                {/* 1. Skin Reactivity Curve (Purple) */}
                <path
                  d="M 20 180 Q 80 170, 140 180 T 260 90 T 380 160 T 500 80 T 580 150 L 580 200 L 20 200 Z"
                  fill="url(#skinAreaGrad)"
                />
                <path
                  d="M 20 180 Q 80 170, 140 180 T 260 90 T 380 160 T 500 80 T 580 150"
                  stroke="#8873B9"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* 2. Tracked Lifestyle Variable Curve */}
                <path
                  d="M 20 160 Q 80 150, 140 160 T 260 70 T 380 170 T 500 65 T 580 130"
                  stroke={currentVar.color}
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Interactive Points along trajectory */}
                {[
                  { x: 20, day: 1 },
                  { x: 140, day: 4 },
                  { x: 260, day: 7, note: 'Stress peak' },
                  { x: 380, day: 10, note: 'Recovery' },
                  { x: 500, day: 13, note: 'Flare co-occurrence' },
                  { x: 580, day: 15 },
                ].map((pt, i) => (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDay(pt.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <circle cx={pt.x} cy="90" r="5" fill="#FFFFFF" stroke="#8873B9" strokeWidth="2.5" />
                    <circle cx={pt.x} cy="70" r="5" fill="#FFFFFF" stroke={currentVar.color} strokeWidth="2.5" />
                  </g>
                ))}
              </svg>
            </div>

            {/* X-Axis Day Labels */}
            <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-3 border-t border-slate-100">
              <span>Day 1</span>
              <span>Day 4</span>
              <span className="text-[#8873B9] font-extrabold">Day 7 (Trigger Event)</span>
              <span>Day 10</span>
              <span className="text-teal-600 font-extrabold">Day 13 (Reaction)</span>
              <span>Day 15</span>
            </div>

            {/* Summary Footnote */}
            <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-[#193653]">
              <span className="text-[#193653]/70">
                Notice how the skin flare reaction line follows approximately 24-48 hours after the lifestyle curve spike.
              </span>
              <span className="font-bold text-blue-600 flex items-center space-x-1 flex-shrink-0 ml-2">
                <span>Lag Phase ~36h</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
