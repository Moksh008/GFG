import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Moon, Smile, Calendar, AlertCircle } from 'lucide-react';
import { SkinCreature } from '../characters/SkinCreature';
import { SkinSurface } from '../characters/SkinSurface';
import { WaterDroplet } from '../characters/FloatingElements';

interface Scene3TakesTollProps {
  progress?: number;
}

export const Scene3TakesToll: React.FC<Scene3TakesTollProps> = ({
  progress = 0,
}) => {
  // Staggered pill entrance progress
  const stressProgress = Math.min(Math.max((progress - 0.1) / 0.3, 0), 1);
  const sleepProgress = Math.min(Math.max((progress - 0.2) / 0.3, 0), 1);
  const moodProgress = Math.min(Math.max((progress - 0.15) / 0.3, 0), 1);
  const habitsProgress = Math.min(Math.max((progress - 0.25) / 0.3, 0), 1);

  return (
    <div
      id="scene-takes-toll"
      className="relative min-h-screen w-full flex flex-col justify-between pt-20 pb-12 overflow-hidden transition-colors duration-700 bg-gradient-to-b from-[#F1F6FA] via-[#F4EFEA] to-[#FAF1E8]"
    >
      {/* Warm ambient diffuse glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#F0E5D8]/60 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/5 w-60 h-60 rounded-full bg-[#DAD9F5]/30 blur-2xl pointer-events-none" />

      {/* Main Grid Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-20 flex-1 my-auto">
        {/* Left Column: Headline */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-start text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              The Impact
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-4">
            ...and affect more than just{' '}
            <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#F472B6]/40 decoration-wavy">
              your skin.
            </span>
          </h2>

          <p className="text-base text-[#193653]/75 leading-relaxed max-w-md font-normal">
            Your body’s neuro-immuno-cutaneous system creates intimate feedback loops between everyday mental tension, circadian disruptions, and skin barrier vulnerability.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/80 font-semibold text-[#193653]/70 border border-white">
              Cortisol Surges
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/80 font-semibold text-[#193653]/70 border border-white">
              Lipid Depletion
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/80 font-semibold text-[#193653]/70 border border-white">
              Immune Flare-ups
            </span>
          </div>
        </div>

        {/* Center / Right: Central Creature (25-30% visual scene) + 4 Floating Pill Badges */}
        <div className="lg:col-span-7 xl:col-span-8 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
          <div className="relative w-full max-w-lg h-[400px] flex items-center justify-center">
            {/* --- 4 FLOATING PILL BADGES POSITIONED AROUND CREATURE --- */}

            {/* Pill 1: STRESS (Upper Left) */}
            <motion.div
              className="absolute top-8 left-0 sm:left-4 z-40 select-none cursor-pointer"
              style={{
                opacity: stressProgress,
                transform: `translateX(${(1 - stressProgress) * -40}px) translateY(${(1 - stressProgress) * -20}px)`,
              }}
              whileHover={{ scale: 1.06, y: -2 }}
            >
              <div className="clay-pill px-4 py-2.5 rounded-full flex items-center space-x-2.5 border border-white">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#193653] flex items-center space-x-1">
                    <span>Stress</span>
                    <span className="text-rose-500 font-extrabold text-[11px]">↑</span>
                  </div>
                  <div className="text-[9px] text-[#193653]/60 font-medium">Elevated Cortisol</div>
                </div>
              </div>
            </motion.div>

            {/* Pill 2: POOR SLEEP (Lower Left) */}
            <motion.div
              className="absolute bottom-12 left-2 sm:left-8 z-40 select-none cursor-pointer"
              style={{
                opacity: sleepProgress,
                transform: `translateX(${(1 - sleepProgress) * -40}px) translateY(${(1 - sleepProgress) * 30}px)`,
              }}
              whileHover={{ scale: 1.06, y: -2 }}
            >
              <div className="clay-pill px-4 py-2.5 rounded-full flex items-center space-x-2.5 border border-white">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#193653]">Poor Sleep</div>
                  <div className="text-[9px] text-[#193653]/60 font-medium">Impaired Barrier Repair</div>
                </div>
              </div>
            </motion.div>

            {/* Pill 3: MOOD (Upper Right) */}
            <motion.div
              className="absolute top-12 right-0 sm:right-6 z-40 select-none cursor-pointer"
              style={{
                opacity: moodProgress,
                transform: `translateX(${(1 - moodProgress) * 40}px) translateY(${(1 - moodProgress) * -20}px)`,
              }}
              whileHover={{ scale: 1.06, y: -2 }}
            >
              <div className="clay-pill px-4 py-2.5 rounded-full flex items-center space-x-2.5 border border-white">
                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
                  <Smile className="w-4 h-4 rotate-180" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#193653] flex items-center space-x-1">
                    <span>Mood</span>
                    <span className="text-rose-500 font-extrabold text-[11px]">↓</span>
                  </div>
                  <div className="text-[9px] text-[#193653]/60 font-medium">Psychosomatic Tension</div>
                </div>
              </div>
            </motion.div>

            {/* Pill 4: DAILY HABITS (Lower Right) */}
            <motion.div
              className="absolute bottom-10 right-2 sm:right-8 z-40 select-none cursor-pointer"
              style={{
                opacity: habitsProgress,
                transform: `translateX(${(1 - habitsProgress) * 40}px) translateY(${(1 - habitsProgress) * 30}px)`,
              }}
              whileHover={{ scale: 1.06, y: -2 }}
            >
              <div className="clay-pill px-4 py-2.5 rounded-full flex items-center space-x-2.5 border border-white">
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shadow-inner">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#193653]">Daily Habits</div>
                  <div className="text-[9px] text-[#193653]/60 font-medium">Hydration & Nutrition</div>
                </div>
              </div>
            </motion.div>

            {/* Connecting Dotted Vector Rays from Pills to Creature */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 overflow-visible" fill="none">
              <line x1="80" y1="50" x2="190" y2="170" stroke="#8873B9" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="100" y1="320" x2="200" y2="240" stroke="#8873B9" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="390" y1="65" x2="290" y2="170" stroke="#8873B9" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="370" y1="320" x2="280" y2="240" stroke="#8873B9" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {/* Flanking Small Creatures */}
            <div className="absolute left-8 sm:left-16 bottom-20 z-20">
              <SkinCreature variant="small" size={62} agitated={true} />
            </div>
            <div className="absolute right-10 sm:right-20 bottom-18 z-20">
              <SkinCreature variant="small" size={65} agitated={true} />
            </div>

            {/* Central Dominant Purple Creature (25-30% scale) */}
            <div className="relative z-30">
              <SkinCreature
                variant="boss"
                size={230}
                agitated={true}
                glow={true}
                showExclamation={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Undulating Skin Surface across bottom */}
      <div className="relative w-full z-10 -mt-16">
        <SkinSurface variant="ridge" />
      </div>
    </div>
  );
};
