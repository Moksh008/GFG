import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, Zap, Moon, Smile, Calendar, FileText, Cpu } from 'lucide-react';
import { DermoraCellMascot } from '../characters/DermoraCellMascot';
import { MascotPeaceful } from '../characters/MascotPeaceful';
import { SkinCellCreature } from '../characters/SkinCellCreature';
import { DoctorIllustration } from '../characters/DoctorIllustration';
import { PhoneScanner } from '../characters/PhoneScanner';
import { SkinSurface } from '../characters/SkinSurface';
import { SkinLayersCake, WaterDroplet, DnaHelix, MolecularStructure } from '../characters/FloatingElements';
import { Timeline } from '../Timeline';
import { AnalysisReportModal } from '../AnalysisReportModal';

gsap.registerPlugin(ScrollTrigger);

interface ScrollExperienceProps {
  onStartJourney?: () => void;
  onWatchStory?: () => void;
}

export const ScrollExperience: React.FC<ScrollExperienceProps> = ({
  onStartJourney,
  onWatchStory,
}) => {
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    // Media query to only pin on desktop (>= 1024px) for optimal mobile performance
    const isDesktop = window.innerWidth >= 1024;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinSectionRef.current,
        start: 'top top',
        end: isDesktop ? '+=2500' : '+=1800',
        pin: isDesktop,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);

          // Synchronized milestone indices
          let idx = 0;
          if (p < 0.20) idx = 0;
          else if (p < 0.40) idx = 1;
          else if (p < 0.60) idx = 2;
          else if (p < 0.80) idx = 3;
          else idx = 4;

          setActiveIndex(idx);
        },
      });
    }, pinSectionRef);

    return () => ctx.revert();
  }, []);

  const handleMilestoneClick = (index: number) => {
    if (!pinSectionRef.current) return;
    const progressTargets = [0.02, 0.26, 0.48, 0.68, 0.90];
    const targetProgress = progressTargets[index];

    const st = ScrollTrigger.getAll().find(
      (s) => s.trigger === pinSectionRef.current
    );

    if (st) {
      const scrollY = st.start + targetProgress * (st.end - st.start);
      window.scrollTo({ top: scrollY, behavior: 'smooth' });
    }
  };

  // Helper interpolation functions for smooth continuous overlapping transitions
  const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);
  const range = (val: number, start: number, end: number) => clamp((val - start) / (end - start));

  // --- FAST, COHESIVE OVERLAPPING TRANSITIONS (Zero blank spaces) ---

  // Scene 1 (0.00 to 0.20): starts active, fades out 0.14 - 0.21
  const scene1Opacity = 1 - range(scrollProgress, 0.14, 0.21);
  const scene1TranslateY = range(scrollProgress, 0.12, 0.21) * -30;
  const mascotShiftX = range(scrollProgress, 0.13, 0.24) * -110;
  const mascotOpacity = 1 - range(scrollProgress, 0.15, 0.24);

  // Scene 2 (0.17 to 0.41): enters 0.15 - 0.20 (BEFORE Scene 1 exits!), exits 0.35 - 0.41
  const scene2Opacity = range(scrollProgress, 0.15, 0.20) * (1 - range(scrollProgress, 0.35, 0.41));
  const scene2TranslateY = (1 - range(scrollProgress, 0.15, 0.20)) * 24 - range(scrollProgress, 0.35, 0.41) * 24;

  // Creature growth & multiplication
  const tinyToCenter = range(scrollProgress, 0.12, 0.24);
  const sideFlank1 = range(scrollProgress, 0.20, 0.28);
  const sideFlank2 = range(scrollProgress, 0.27, 0.35);

  // Scene 3 (0.37 to 0.61): enters 0.35 - 0.40 (BEFORE Scene 2 exits!), exits 0.55 - 0.61
  const scene3Opacity = range(scrollProgress, 0.35, 0.40) * (1 - range(scrollProgress, 0.55, 0.61));
  const scene3TranslateY = (1 - range(scrollProgress, 0.35, 0.40)) * 24 - range(scrollProgress, 0.55, 0.61) * 24;

  // 4 Pill badges entry (fast & cohesive)
  const stressPill = range(scrollProgress, 0.38, 0.46);
  const sleepPill = range(scrollProgress, 0.40, 0.48);
  const moodPill = range(scrollProgress, 0.42, 0.50);
  const habitsPill = range(scrollProgress, 0.44, 0.52);

  // Central creature scale from medium to main
  const mainCreatureScale = 1 + range(scrollProgress, 0.36, 0.48) * 0.35;

  // Scene 4 (0.57 to 0.81): enters 0.55 - 0.60 (BEFORE Scene 3 exits!), exits 0.75 - 0.81
  const scene4Opacity = range(scrollProgress, 0.55, 0.60) * (1 - range(scrollProgress, 0.75, 0.81));
  const scene4TranslateY = (1 - range(scrollProgress, 0.55, 0.60)) * 24 - range(scrollProgress, 0.75, 0.81) * 24;

  // Phone slide-in from below
  const phoneEnter = range(scrollProgress, 0.56, 0.66);
  const phoneExit = range(scrollProgress, 0.75, 0.82);
  const phoneTranslateY = (1 - phoneEnter) * 280 + phoneExit * 260;
  const phoneOpacity = phoneEnter * (1 - phoneExit);

  // Scene 5 (0.76 to 1.00): enters 0.75 - 0.82 (BEFORE Scene 4 exits!)
  const scene5Opacity = range(scrollProgress, 0.76, 0.84);
  const scene5TranslateY = (1 - range(scrollProgress, 0.76, 0.84)) * 24;

  // Background subtle gradient warmth
  const bgWarmth = range(scrollProgress, 0.32, 0.60);

  return (
    <div id="hero" className="relative w-full">
      {/* Fixed Vertical Timeline on desktop, compact pill on mobile */}
      <Timeline
        activeIndex={activeIndex}
        scrollProgress={scrollProgress}
        onMilestoneClick={handleMilestoneClick}
      />

      {/* --- PINNED VIEWPORT STAGE --- */}
      <div
        ref={pinSectionRef}
        className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between pt-24 pb-4"
      >
        {/* Continuous Soft Illustrated Background */}
        <div
          className="absolute inset-0 transition-colors duration-500 pointer-events-none -z-20"
          style={{
            background: `linear-gradient(180deg, 
              rgba(220, 234, 245, ${0.45 - bgWarmth * 0.15}) 0%, 
              rgba(250, 248, 244, 1) 50%, 
              rgba(${250 - bgWarmth * 6}, ${248 - bgWarmth * 12}, ${244 - bgWarmth * 16}, 1) 100%)`,
          }}
        />

        {/* Ambient Soft Glowing Orbs (Behind content, zero collision) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#B8D0E4]/25 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full bg-[#DAD9F5]/30 blur-3xl pointer-events-none -z-10" />

        {/* Decorative Non-Competing Elements (Safely pinned to edges) */}
        <div
          className="absolute top-28 left-6 md:left-12 pointer-events-none -z-10 hidden sm:block transition-all duration-300"
          style={{ opacity: scene1Opacity, transform: `translateY(${scene1TranslateY}px)` }}
        >
          <SkinLayersCake size={95} />
        </div>

        <div
          className="absolute top-36 left-48 pointer-events-none -z-10 hidden lg:block transition-all duration-300"
          style={{ opacity: scene1Opacity }}
        >
          <MolecularStructure />
        </div>

        <div
          className="absolute top-28 right-24 xl:right-48 pointer-events-none -z-10 hidden md:block transition-all duration-300"
          style={{ opacity: scene1Opacity }}
        >
          <DnaHelix width={150} height={80} />
        </div>

        {/* --- DEDICATED 2-COLUMN GRID (Prevents all text and visual collisions!) --- */}
        {/* Reserved right padding (lg:pr-40 xl:pr-48) protects vertical timeline */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 lg:pr-40 xl:pr-48 w-full flex-1 flex items-center z-20 my-auto">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center min-h-[440px]">
            
            {/* ========================================================= */}
            {/* COLUMN 1: DEDICATED TEXT COLUMN (Lg: 5 cols, max-w-md)    */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 relative min-h-[300px] flex items-center text-left">
              
              {/* --- SCENE 1 TEXT: IT STARTS SMALL --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-300"
                style={{
                  opacity: scene1Opacity,
                  transform: `translateY(${scene1TranslateY}px)`,
                  pointerEvents: scene1Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-xs mb-3.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
                    Skin • Mind • Lifestyle
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.15] mb-3.5 max-w-md">
                  A small skin concern might{' '}
                  <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#93C5FD]/60 decoration-wavy decoration-2">
                    not stay small...
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#193653]/75 leading-relaxed max-w-sm mb-6 font-normal">
                  Skin changes often start subtle, but can grow, spread and flare up — especially when stress, sleep and daily life are out of balance.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onStartJourney}
                    className="group px-6 py-3 rounded-full bg-[#193653] hover:bg-[#234A70] text-white text-xs sm:text-sm font-bold shadow-md glow-navy flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onWatchStory}
                    className="px-5 py-3 rounded-full bg-white/85 hover:bg-white text-[#193653] text-xs sm:text-sm font-semibold border border-white shadow-xs flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#DCEAF5] flex items-center justify-center text-[#193653]">
                      <Play className="w-2 h-2 fill-current ml-0.5" />
                    </div>
                    <span>Watch the Story</span>
                  </button>
                </div>
              </div>

              {/* --- SCENE 2 TEXT: IT MULTIPLIES --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-300"
                style={{
                  opacity: scene2Opacity,
                  transform: `translateY(${scene2TranslateY}px)`,
                  pointerEvents: scene2Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-xs mb-3.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
                    The Build Up
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-3.5 max-w-md">
                  It can grow and spread...
                </h2>

                <p className="text-sm sm:text-base text-[#193653]/75 leading-relaxed max-w-sm font-normal">
                  Without timely care, what begins as a minor cellular irritation can spread across compromised barrier lipids.
                </p>
              </div>

              {/* --- SCENE 3 TEXT: IT TAKES A TOLL --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-300"
                style={{
                  opacity: scene3Opacity,
                  transform: `translateY(${scene3TranslateY}px)`,
                  pointerEvents: scene3Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-xs mb-3.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
                    The Impact
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-3.5 max-w-md">
                  ...and affect more than just{' '}
                  <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#F472B6]/40 decoration-wavy">
                    your skin.
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-[#193653]/75 leading-relaxed max-w-sm font-normal">
                  Elevated cortisol, irregular circadian sleep and lifestyle stress accelerate skin barrier sensitivity in interconnected cycles.
                </p>
              </div>

              {/* --- SCENE 4 TEXT: SCAN AND ANALYSE --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-300"
                style={{
                  opacity: scene4Opacity,
                  transform: `translateY(${scene4TranslateY}px)`,
                  pointerEvents: scene4Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-xs mb-3.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
                    The Solution
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-3.5 max-w-md">
                  Catch it early with{' '}
                  <span className="text-teal-600">Dermora.</span>
                </h2>

                <p className="text-sm sm:text-base text-[#193653]/75 leading-relaxed max-w-sm font-normal mb-5">
                  Capture, analyse and understand your skin with AI before concerns become harder to manage.
                </p>

                <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sub-Dermal Vision Analysis</span>
                </div>
              </div>

              {/* --- SCENE 5 TEXT: REVIEW WITH A DOCTOR --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-300"
                style={{
                  opacity: scene5Opacity,
                  transform: `translateY(${scene5TranslateY}px)`,
                  pointerEvents: scene5Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-xs mb-3.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
                    Get Expert Care
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-3.5 max-w-md">
                  Personal insights, right to{' '}
                  <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#60A5FA]/40 decoration-wavy">
                    your doctor.
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-[#193653]/75 leading-relaxed max-w-sm font-normal mb-5">
                  Your analysed report is shared with a dermatology expert for timely, personalised care.
                </p>

                <button
                  onClick={onStartJourney}
                  className="group px-6 py-3 rounded-full bg-[#193653] hover:bg-[#234A70] text-white text-xs sm:text-sm font-bold shadow-md glow-navy flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Start Your Skin Health Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* ========================================================= */}
            {/* COLUMN 2: DEDICATED ILLUSTRATION STAGE (Lg: 7 cols)       */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 relative min-h-[440px] flex items-center justify-center overflow-visible">

              {/* 1. DERMORA LIVING CELL MASCOT (Hero -> Steps Aside in Scene 2) */}
              {/* Follows cursor smoothly, breaths, blinks, tilts */}
              <div
                className="absolute z-20 transition-all duration-300"
                style={{
                  opacity: mascotOpacity,
                  transform: `translateX(${mascotShiftX}px)`,
                  pointerEvents: mascotOpacity > 0.2 ? 'auto' : 'none',
                }}
              >
                <DermoraCellMascot size={270} interactive={true} />
              </div>

              {/* 2. THE CUTE PURPLE SKIN CELL CHARACTERS */}
              <div
                className="relative z-25 flex items-center justify-center"
                style={{
                  opacity: 1 - phoneEnter * 0.9,
                }}
              >
                {/* Flank 1 (Left): Small cute purple cell */}
                <div
                  className="absolute -left-16 sm:-left-24 bottom-4 transition-all duration-300"
                  style={{
                    opacity: sideFlank1 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.3 + sideFlank1 * 0.7}) translateY(${(1 - sideFlank1) * 25}px)`,
                  }}
                >
                  <SkinCellCreature size="small" concerned={scrollProgress > 0.38} />
                </div>

                {/* Flank 2 (Far Left Low): Tiny cute purple cell */}
                <div
                  className="absolute -left-28 sm:-left-36 bottom-12 transition-all duration-300"
                  style={{
                    opacity: sideFlank2 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.2 + sideFlank2 * 0.6}) translateY(${(1 - sideFlank2) * 20}px)`,
                  }}
                >
                  <SkinCellCreature size={48} concerned={scrollProgress > 0.38} />
                </div>

                {/* CENTRAL CUTE PURPLE CELL: Moves from Hero right position -> Centers -> Plumps to large size */}
                <div
                  className="transition-all duration-300"
                  style={{
                    transform: `translateX(${(1 - tinyToCenter) * 100}px) scale(${
                      scrollProgress < 0.2
                        ? 0.75
                        : scrollProgress < 0.38
                        ? 1.05
                        : mainCreatureScale
                    })`,
                  }}
                >
                  <SkinCellCreature
                    size={scrollProgress < 0.22 ? 'small' : scrollProgress < 0.40 ? 'medium' : 'large'}
                    showExclamation={scrollProgress < 0.20}
                    concerned={scrollProgress >= 0.38}
                  />
                </div>

                {/* Flank 3 (Right): Small cute purple cell */}
                <div
                  className="absolute -right-16 sm:-right-24 bottom-4 transition-all duration-300"
                  style={{
                    opacity: sideFlank1 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.3 + sideFlank1 * 0.7}) translateY(${(1 - sideFlank1) * 25}px)`,
                  }}
                >
                  <SkinCellCreature size="small" concerned={scrollProgress > 0.38} />
                </div>

                {/* Flank 4 (Far Right Low): Tiny cute purple cell */}
                <div
                  className="absolute -right-28 sm:-right-36 bottom-12 transition-all duration-300"
                  style={{
                    opacity: sideFlank2 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.2 + sideFlank2 * 0.6}) translateY(${(1 - sideFlank2) * 20}px)`,
                  }}
                >
                  <SkinCellCreature size={50} concerned={scrollProgress > 0.38} />
                </div>
              </div>

              {/* 3. SCENE 3: 4 FLOATING PILL BADGES (GLIDE IN AROUND CREATURE) */}
              <div
                className="absolute inset-0 pointer-events-none z-30"
                style={{ opacity: scene3Opacity }}
              >
                {/* Pill 1: Stress (Top Left) */}
                <div
                  className="absolute top-4 left-0 sm:left-6 transition-transform duration-300"
                  style={{
                    transform: `translate(${(1 - stressPill) * -35}px, ${(1 - stressPill) * -18}px)`,
                    opacity: stressPill,
                  }}
                >
                  <div className="clay-pill px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white shadow-xs">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Zap className="w-3 h-3" />
                    </div>
                    <div className="text-left text-[11px] font-bold text-[#193653]">
                      <span>Stress </span>
                      <span className="text-rose-500 font-extrabold">↑</span>
                    </div>
                  </div>
                </div>

                {/* Pill 2: Poor Sleep (Bottom Left) */}
                <div
                  className="absolute bottom-8 left-0 sm:left-8 transition-transform duration-300"
                  style={{
                    transform: `translate(${(1 - sleepPill) * -35}px, ${(1 - sleepPill) * 18}px)`,
                    opacity: sleepPill,
                  }}
                >
                  <div className="clay-pill px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white shadow-xs">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Moon className="w-3 h-3" />
                    </div>
                    <div className="text-left text-[11px] font-bold text-[#193653]">Poor Sleep</div>
                  </div>
                </div>

                {/* Pill 3: Mood (Top Right) */}
                <div
                  className="absolute top-4 right-0 sm:right-6 transition-transform duration-300"
                  style={{
                    transform: `translate(${(1 - moodPill) * 35}px, ${(1 - moodPill) * -18}px)`,
                    opacity: moodPill,
                  }}
                >
                  <div className="clay-pill px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white shadow-xs">
                    <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                      <Smile className="w-3 h-3 rotate-180" />
                    </div>
                    <div className="text-left text-[11px] font-bold text-[#193653]">
                      <span>Mood </span>
                      <span className="text-rose-500 font-extrabold">↓</span>
                    </div>
                  </div>
                </div>

                {/* Pill 4: Daily Habits (Bottom Right) */}
                <div
                  className="absolute bottom-6 right-0 sm:right-8 transition-transform duration-300"
                  style={{
                    transform: `translate(${(1 - habitsPill) * 35}px, ${(1 - habitsPill) * 18}px)`,
                    opacity: habitsPill,
                  }}
                >
                  <div className="clay-pill px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white shadow-xs">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div className="text-left text-[11px] font-bold text-[#193653]">Daily Habits</div>
                  </div>
                </div>
              </div>

              {/* 4. SCENE 4: TILTED SMARTPHONE & SCAN (GLIDES UP SMOOTHLY) */}
              <div
                className="absolute z-35 transition-all duration-300 flex items-center justify-center"
                style={{
                  opacity: phoneOpacity,
                  transform: `translateY(${phoneTranslateY}px)`,
                  pointerEvents: phoneOpacity > 0.4 ? 'auto' : 'none',
                }}
              >
                <PhoneScanner onScanComplete={() => setIsReportOpen(true)} />
              </div>

              {/* 5. SCENE 5: DOCTOR & DERMORA REPORT CARD (HANDOFF FROM SCAN) */}
              <div
                className="absolute inset-0 z-40 flex items-center justify-center gap-3 sm:gap-4 transition-all duration-300"
                style={{
                  opacity: scene5Opacity,
                  transform: `translateY(${scene5TranslateY}px)`,
                  pointerEvents: scene5Opacity > 0.4 ? 'auto' : 'none',
                }}
              >
                {/* Peaceful Mascot on Left with Glowing Heart */}
                <div className="flex flex-col items-center">
                  <MascotPeaceful size={140} />
                  <span className="mt-1 text-[9px] font-bold text-[#193653]/60 bg-white/70 px-2 py-0.5 rounded-full border border-white">
                    Patient Solace
                  </span>
                </div>

                {/* Animated Dotted Flow Arrow 1 */}
                <div className="hidden sm:block w-6 border-t-2 border-dashed border-[#8873B9] opacity-60" />

                {/* Dermora Report Card in Center */}
                <motion.div
                  className="w-full max-w-[210px] cursor-pointer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  onClick={() => setIsReportOpen(true)}
                >
                  <div className="clay-card rounded-2xl p-3 shadow-md border border-white text-left">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#193653]/10">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-extrabold text-[#193653]">Dermora Report</span>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Verified
                      </span>
                    </div>

                    <div className="my-1.5 rounded-xl bg-gradient-to-br from-[#E2EEF8] to-[#FCEEE2] p-1 flex items-center justify-center border border-white/60">
                      <div className="scale-60 -my-2">
                        <SkinCellCreature size={50} />
                      </div>
                    </div>

                    <div className="space-y-1 text-[9px] font-bold text-[#193653]">
                      <div className="flex justify-between">
                        <span>Erythema Index</span>
                        <span className="text-amber-600">Mild (32%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full w-[32%]" />
                      </div>
                      <div className="pt-1 text-[8.5px] font-semibold text-blue-600 flex items-center justify-center space-x-1">
                        <span>View full clinical analysis</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Animated Dotted Flow Arrow 2 */}
                <div className="hidden sm:block w-6 border-t-2 border-dashed border-[#0D9488] opacity-60" />

                {/* Illustrated Dermatologist on Right */}
                <div className="flex flex-col items-center">
                  <DoctorIllustration size={155} />
                  <span className="mt-1 text-[9px] font-bold text-[#193653]/60 bg-white/70 px-2 py-0.5 rounded-full border border-white">
                    Dr. Henderson
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* --- DELICATE ORGANIC WAVE SKIN SURFACE AT BOTTOM (No heavy brown bar!) --- */}
        <div className="relative w-full z-15 -mb-2">
          <SkinSurface variant="hero" />
        </div>

        {/* Bouncing Scroll Cue (Visible only on hero) */}
        <div
          className="relative z-30 mx-auto -mt-6 pb-2 flex flex-col items-center space-y-1 transition-opacity duration-300"
          style={{ opacity: scene1Opacity }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-[#193653]/60 uppercase">
            Scroll to see the journey
          </span>
          <div className="w-6 h-6 rounded-full bg-white/90 border border-white shadow-xs flex items-center justify-center text-[#193653] animate-bounce">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Full Clinical Analysis Report Modal */}
      <AnalysisReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

export default ScrollExperience;
