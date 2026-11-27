import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, CheckCircle2, Share2, Stethoscope, Sparkles } from 'lucide-react';
import { MascotPeaceful } from '../characters/MascotPeaceful';
import { DoctorIllustration } from '../characters/DoctorIllustration';
import { SkinCreature } from '../characters/SkinCreature';
import { SkinSurface } from '../characters/SkinSurface';
import { WaterDroplet } from '../characters/FloatingElements';

interface Scene5DoctorReviewProps {
  onStartJourney?: () => void;
  onOpenReport?: () => void;
}

export const Scene5DoctorReview: React.FC<Scene5DoctorReviewProps> = ({
  onStartJourney,
  onOpenReport,
}) => {
  const [reportHovered, setReportHovered] = useState(false);

  return (
    <div
      id="scene-doctor"
      className="relative min-h-screen w-full flex flex-col justify-between pt-20 pb-16 overflow-hidden bg-gradient-to-b from-[#EAF2F8] via-[#FAF8F4] to-[#F5ECE1]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[350px] rounded-full bg-[#DAD9F5]/35 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-100/40 blur-2xl pointer-events-none" />

      {/* Main Grid Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-20 flex-1 my-auto">
        {/* Left Column: Headlines & Call to Action */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-start text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              Get Expert Care
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-4">
            Personal insights, right to{' '}
            <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#60A5FA]/40 decoration-wavy">
              your doctor.
            </span>
          </h2>

          <p className="text-base text-[#193653]/75 leading-relaxed max-w-md font-normal mb-8">
            Your analysed report is shared with a dermatology expert for timely, personalised care. Eliminate guesswork with objective timelines and symptom correlation.
          </p>

          {/* Prominent CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <button
              onClick={onStartJourney}
              className="group px-7 py-3.5 rounded-full bg-[#193653] hover:bg-[#234A70] text-white text-sm font-bold shadow-xl glow-navy flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Start Your Skin Health Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Center / Right: Interactive Trio (Mascot Peaceful -> Dermora Report -> Doctor) */}
        <div className="lg:col-span-8 xl:col-span-8 relative flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 min-h-[460px]">
          {/* Animated SVG Dotted Connecting Arrows across the Trio */}
          <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" fill="none">
            <defs>
              <linearGradient id="flowLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8873B9" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
            </defs>

            {/* Path 1: Mascot to Report */}
            <path
              d="M120 230 C170 210, 200 210, 240 220"
              stroke="url(#flowLineGrad)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="animate-pulse"
            />
            {/* Arrowhead 1 */}
            <polygon points="244,221 234,215 236,226" fill="#3B82F6" />

            {/* Path 2: Report to Doctor */}
            <path
              d="M380 220 C420 210, 450 210, 500 230"
              stroke="url(#flowLineGrad)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="animate-pulse"
            />
            {/* Arrowhead 2 */}
            <polygon points="504,231 494,225 496,236" fill="#0D9488" />
          </svg>

          {/* 1. Mascot in Peaceful Pose (Left) */}
          <div className="relative z-20 flex flex-col items-center">
            <MascotPeaceful size={180} />
            <span className="mt-2 text-[11px] font-bold text-[#193653]/70 bg-white/70 px-3 py-1 rounded-full border border-white">
              Patient Solace
            </span>
          </div>

          {/* 2. Interactive Dermora Report Card (Center) */}
          <motion.div
            className="relative z-30 w-full max-w-[270px] cursor-pointer"
            whileHover={{ scale: 1.04, y: -4 }}
            onClick={onOpenReport}
            onMouseEnter={() => setReportHovered(true)}
            onMouseLeave={() => setReportHovered(false)}
          >
            <div className="clay-card rounded-3xl p-4 shadow-xl border border-white">
              {/* Report Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#193653]/10">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-extrabold text-[#193653]">Dermora Report</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Verified AI
                </span>
              </div>

              {/* Sample Visual Thumbnail */}
              <div className="my-3 rounded-2xl bg-gradient-to-br from-[#E2EEF8] to-[#FCEEE2] p-2.5 flex items-center justify-center border border-white/60 relative overflow-hidden">
                <div className="scale-60 -my-3">
                  <SkinCreature variant="tiny" size={70} agitated={false} />
                </div>
                <div className="absolute bottom-1 right-2 text-[9px] font-semibold text-[#193653]/60 bg-white/80 px-2 py-0.5 rounded-full">
                  Perimeter: 4.8mm
                </div>
              </div>

              {/* Observation Metric Rows */}
              <div className="space-y-2 text-left">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-[#193653]">
                    <span>Erythema Index</span>
                    <span className="text-amber-600 font-extrabold">Mild (32%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[32%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-[#193653]">
                    <span>Barrier Hydration</span>
                    <span className="text-teal-600 font-extrabold">Optimal (84%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full w-[84%]" />
                  </div>
                </div>

                {/* Clinical Notes row */}
                <div className="pt-2 border-t border-slate-100 text-[10px] text-[#193653]/70 flex items-center justify-between">
                  <span>Correlated with: Stress spike</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                </div>
              </div>

              {/* View Full Report Hover Bar */}
              <div className="mt-3 pt-2 text-center text-[10px] font-bold text-blue-600 flex items-center justify-center space-x-1 bg-blue-50/70 py-1.5 rounded-xl border border-blue-100">
                <span>Click to view full analysis</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </motion.div>

          {/* 3. Illustrated Dermatologist (Right) */}
          <div className="relative z-20 flex flex-col items-center">
            <DoctorIllustration size={200} />
            <span className="mt-2 text-[11px] font-bold text-[#193653]/70 bg-white/70 px-3 py-1 rounded-full border border-white">
              Clinical Review
            </span>
          </div>
        </div>
      </div>

      {/* Undulating Skin Surface across lower half */}
      <div className="relative w-full z-10 -mt-16">
        <SkinSurface variant="ridge" />
      </div>
    </div>
  );
};
