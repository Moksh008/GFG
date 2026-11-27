import React from 'react';
import { motion } from 'framer-motion';

export interface Milestone {
  id: string;
  number: number;
  label: string;
  targetId: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'starts-small', number: 1, label: 'It Starts Small', targetId: 'hero' },
  { id: 'multiplies', number: 2, label: 'It Multiplies', targetId: 'multiplies' },
  { id: 'takes-toll', number: 3, label: 'It Takes a Toll', targetId: 'takes-toll' },
  { id: 'scan-analyse', number: 4, label: 'Scan & Analyse', targetId: 'scan-analyse' },
  { id: 'review-doctor', number: 5, label: 'Review with a Doctor', targetId: 'review-doctor' },
];

interface TimelineProps {
  activeIndex: number; // 0 to 4
  scrollProgress: number; // 0 to 1
  onMilestoneClick: (index: number, targetId: string) => void;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  activeIndex,
  scrollProgress,
  onMilestoneClick,
  className = '',
}) => {
  return (
    <>
      {/* --- DESKTOP FIXED VERTICAL TIMELINE --- */}
      <div
        className={`hidden lg:flex fixed right-8 xl:right-14 top-1/2 -translate-y-1/2 z-40 flex-col items-start select-none ${className}`}
        style={{ width: '180px' }}
      >
        <div className="relative py-4 pl-3">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-[2px]">
            <div className="absolute inset-0 bg-[#DCEAF5] rounded-full" />
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#193653] via-[#3B82F6] to-[#0D9488] rounded-full transition-all duration-200"
              style={{
                height: `${Math.min(Math.max(scrollProgress * 100, 4), 100)}%`,
              }}
            />
          </div>

          {/* Milestone Nodes */}
          <div className="flex flex-col space-y-11 relative z-10">
            {MILESTONES.map((milestone, idx) => {
              const isActive = activeIndex === idx;
              const isPassed = activeIndex >= idx;

              return (
                <button
                  key={milestone.id}
                  onClick={() => onMilestoneClick(idx, milestone.targetId)}
                  className="group flex items-center space-x-3.5 focus:outline-none text-left cursor-pointer transition-all"
                >
                  {/* Node Circle */}
                  <div
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-[#193653] scale-125 ring-4 ring-[#B8D0E4]/60 shadow-[0_0_14px_rgba(25,54,83,0.35)]'
                        : isPassed
                        ? 'bg-[#3B82F6] ring-2 ring-white shadow-xs'
                        : 'bg-white border-2 border-[#B8D0E4] hover:border-[#193653]'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isActive
                          ? 'bg-teal-300 animate-pulse'
                          : isPassed
                          ? 'bg-white'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Label Text */}
                  <span
                    className={`text-xs tracking-tight transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'font-bold text-[#193653] translate-x-1'
                        : isPassed
                        ? 'font-medium text-[#193653]/80'
                        : 'font-normal text-[#193653]/45 group-hover:text-[#193653]/80'
                    }`}
                  >
                    {milestone.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- MOBILE COMPACT BOTTOM PROGRESS PILL --- */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto clay-pill rounded-full px-4 py-2 flex items-center space-x-3 shadow-xl border border-white">
          <span className="text-[11px] font-bold text-[#193653] whitespace-nowrap">
            Step {activeIndex + 1}/5: {MILESTONES[activeIndex]?.label}
          </span>
          <div className="flex items-center space-x-1.5">
            {MILESTONES.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => onMilestoneClick(idx, m.targetId)}
                aria-label={`Go to ${m.label}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeIndex === idx
                    ? 'w-4 bg-[#193653]'
                    : activeIndex > idx
                    ? 'bg-[#3B82F6]'
                    : 'bg-[#B8D0E4]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
