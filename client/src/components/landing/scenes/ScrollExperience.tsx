import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, Zap, Moon, Smile, Calendar, FileText, Activity } from 'lucide-react';
import { HeroImageIllustration } from '../hero/HeroImageIllustration';
import { MascotPeaceful } from '../characters/MascotPeaceful';
import { SkinCellCreature } from '../characters/SkinCellCreature';
import { DoctorIllustration } from '../characters/DoctorIllustration';
import { PhoneScanner } from '../characters/PhoneScanner';
import { SkinSurface } from '../characters/SkinSurface';
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

  // Scene 1 (0.00 to 0.20)
  const scene1Opacity = 1 - range(scrollProgress, 0.14, 0.21);
  const scene1TranslateY = range(scrollProgress, 0.12, 0.21) * -20;
  const heroConsoleOpacity = 1 - range(scrollProgress, 0.13, 0.22);
  const heroConsoleTranslateY = range(scrollProgress, 0.10, 0.22) * -35;
  const heroConsoleScale = 1 - range(scrollProgress, 0.10, 0.22) * 0.05;

  // Scene 2 (0.17 to 0.41)
  const scene2Opacity = range(scrollProgress, 0.15, 0.20) * (1 - range(scrollProgress, 0.35, 0.41));
  const scene2TranslateY = (1 - range(scrollProgress, 0.15, 0.20)) * 20 - range(scrollProgress, 0.35, 0.41) * 20;

  // Creature growth & multiplication
  const tinyToCenter = range(scrollProgress, 0.12, 0.24);
  const sideFlank1 = range(scrollProgress, 0.20, 0.28);
  const sideFlank2 = range(scrollProgress, 0.27, 0.35);

  // Scene 3 (0.37 to 0.61)
  const scene3Opacity = range(scrollProgress, 0.35, 0.40) * (1 - range(scrollProgress, 0.55, 0.61));
  const scene3TranslateY = (1 - range(scrollProgress, 0.35, 0.40)) * 20 - range(scrollProgress, 0.55, 0.61) * 20;

  // 4 indicators entry
  const stressPill = range(scrollProgress, 0.38, 0.46);
  const sleepPill = range(scrollProgress, 0.40, 0.48);
  const moodPill = range(scrollProgress, 0.42, 0.50);
  const habitsPill = range(scrollProgress, 0.44, 0.52);

  const mainCreatureScale = 1 + range(scrollProgress, 0.36, 0.48) * 0.35;

  // Scene 4 (0.57 to 0.81)
  const scene4Opacity = range(scrollProgress, 0.55, 0.60) * (1 - range(scrollProgress, 0.75, 0.81));
  const scene4TranslateY = (1 - range(scrollProgress, 0.55, 0.60)) * 20 - range(scrollProgress, 0.75, 0.81) * 20;

  // Phone slide-in
  const phoneEnter = range(scrollProgress, 0.56, 0.66);
  const phoneExit = range(scrollProgress, 0.75, 0.82);
  const phoneTranslateY = (1 - phoneEnter) * 260 + phoneExit * 240;
  const phoneOpacity = phoneEnter * (1 - phoneExit);

  // Scene 5 (0.76 to 1.00)
  const scene5Opacity = range(scrollProgress, 0.76, 0.84);
  const scene5TranslateY = (1 - range(scrollProgress, 0.76, 0.84)) * 20;

  return (
    <div id="hero" className="relative w-full">
      {/* Fixed Vertical Timeline on desktop, compact bar on mobile */}
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
        {/* Calm Warm Background Surface */}
        <div
          className="absolute inset-0 pointer-events-none -z-20 bg-[#FAF8F4]"
        />

        {/* --- DEDICATED 2-COLUMN GRID --- */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 lg:pr-40 xl:pr-48 w-full flex-1 flex items-center z-20 my-auto">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center min-h-[440px]">
            
            {/* COLUMN 1: DEDICATED TEXT COLUMN */}
            <div className="lg:col-span-5 relative min-h-[300px] flex items-center text-left">
              
              {/* --- SCENE 1 TEXT: EARLY DETECTION --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-200"
                style={{
                  opacity: scene1Opacity,
                  transform: `translateY(${scene1TranslateY}px)`,
                  pointerEvents: scene1Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                {/* Signature Reticle Tag */}
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs mb-4">
                  <span className="text-[10px] font-mono font-medium text-teal-700">[ + ] Early detection</span>
                  <span className="text-slate-300 text-xs">|</span>
                  <span className="text-xs text-slate-600">Circadian & barrier health</span>
                </div>

                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-medium text-[#193653] tracking-tight leading-[1.12] mb-3.5 max-w-md">
                  Subtle skin changes deserve early attention
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm mb-6 font-normal">
                  Microscopic barrier irritations start quietly before escalating into flares. Dermora pairs visual tracking with daily sleep and stress context for calm clarity.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onStartJourney}
                    className="px-5 py-2.5 rounded-lg bg-[#193653] hover:bg-[#234A70] text-white text-xs sm:text-sm font-medium shadow-sm flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <span>Start clinical scan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onWatchStory}
                    className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-[#193653] text-xs sm:text-sm font-medium border border-slate-200 shadow-2xs flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-600" />
                    <span>How it works</span>
                  </button>
                </div>
              </div>

              {/* --- SCENE 2 TEXT: BARRIER PROGRESSION --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-200"
                style={{
                  opacity: scene2Opacity,
                  transform: `translateY(${scene2TranslateY}px)`,
                  pointerEvents: scene2Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs mb-4">
                  <span className="text-[10px] font-mono font-medium text-amber-700">[ + ] Progression</span>
                  <span className="text-slate-300 text-xs">|</span>
                  <span className="text-xs text-slate-600">Cellular boundary</span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-medium text-[#193653] tracking-tight leading-[1.12] mb-3.5 max-w-md">
                  Irritation can progress across compromised barriers
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm font-normal">
                  Without timely observation, localized micro-reactions often expand into larger inflammatory regions across vulnerable lipid layers.
                </p>
              </div>

              {/* --- SCENE 3 TEXT: SYSTEMIC FACTORS --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-200"
                style={{
                  opacity: scene3Opacity,
                  transform: `translateY(${scene3TranslateY}px)`,
                  pointerEvents: scene3Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs mb-4">
                  <span className="text-[10px] font-mono font-medium text-rose-700">[ + ] Systemic correlation</span>
                  <span className="text-slate-300 text-xs">|</span>
                  <span className="text-xs text-slate-600">Sleep & neuro-response</span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-medium text-[#193653] tracking-tight leading-[1.12] mb-3.5 max-w-md">
                  Stress and sleep directly affect barrier resilience
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm font-normal">
                  Elevated cortisol and sleep deficits reduce restorative lipid replenishment, amplifying dermal sensitivity in measurable cycles.
                </p>
              </div>

              {/* --- SCENE 4 TEXT: VISION SCAN --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-200"
                style={{
                  opacity: scene4Opacity,
                  transform: `translateY(${scene4TranslateY}px)`,
                  pointerEvents: scene4Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs mb-4">
                  <span className="text-[10px] font-mono font-medium text-teal-700">[ + ] Objective imaging</span>
                  <span className="text-slate-300 text-xs">|</span>
                  <span className="text-xs text-slate-600">Computer vision</span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-medium text-[#193653] tracking-tight leading-[1.12] mb-3.5 max-w-md">
                  Quantify dermal shifts with computer vision
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm font-normal mb-5">
                  Measure surface redness, border regularity, and lesion symmetry in seconds using calibrated mobile macro capture.
                </p>

                <div className="flex items-center space-x-2 text-xs font-mono text-teal-900 bg-teal-50 px-3 py-1.5 rounded-md border border-teal-200/80">
                  <Activity className="w-3.5 h-3.5 text-teal-700" />
                  <span>Sub-dermal pattern analysis</span>
                </div>
              </div>

              {/* --- SCENE 5 TEXT: CLINICAL REVIEW --- */}
              <div
                className="absolute inset-x-0 flex flex-col items-start transition-all duration-200"
                style={{
                  opacity: scene5Opacity,
                  transform: `translateY(${scene5TranslateY}px)`,
                  pointerEvents: scene5Opacity > 0.3 ? 'auto' : 'none',
                }}
              >
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs mb-4">
                  <span className="text-[10px] font-mono font-medium text-blue-700">[ + ] Clinical triage</span>
                  <span className="text-slate-300 text-xs">|</span>
                  <span className="text-xs text-slate-600">Clinician synergy</span>
                </div>

                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-medium text-[#193653] tracking-tight leading-[1.12] mb-3.5 max-w-md">
                  Export verifiable summaries for your dermatologist
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm font-normal mb-5">
                  Synthesize 14-day symptom logs and imaging histories into an objective clinical brief ready for doctor review.
                </p>

                <button
                  onClick={onStartJourney}
                  className="px-5 py-2.5 rounded-lg bg-[#193653] hover:bg-[#234A70] text-white text-xs sm:text-sm font-medium shadow-sm flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Begin clinical assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* COLUMN 2: DEDICATED ILLUSTRATION STAGE */}
            <div className="lg:col-span-7 relative min-h-[440px] flex items-center justify-center overflow-visible">

              {/* 1. HERO IMAGE ILLUSTRATION */}
              <div
                className="absolute z-30 w-full flex justify-center lg:justify-end transition-all duration-200"
                style={{
                  opacity: heroConsoleOpacity,
                  transform: `translateY(${heroConsoleTranslateY}px) scale(${heroConsoleScale})`,
                  pointerEvents: heroConsoleOpacity > 0.2 ? 'auto' : 'none',
                }}
              >
                <HeroImageIllustration onExplore={onStartJourney} />
              </div>

              {/* 2. THE SKIN CELL CHARACTERS */}
              <div
                className="relative z-20 flex items-center justify-center transition-opacity duration-200"
                style={{
                  opacity: range(scrollProgress, 0.12, 0.20) * (1 - phoneEnter * 0.9),
                  pointerEvents: scrollProgress > 0.16 ? 'auto' : 'none',
                }}
              >
                {/* Flank 1 (Left) */}
                <div
                  className="absolute -left-16 sm:-left-24 bottom-4 transition-all duration-200"
                  style={{
                    opacity: sideFlank1 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.3 + sideFlank1 * 0.7}) translateY(${(1 - sideFlank1) * 20}px)`,
                  }}
                >
                  <SkinCellCreature size="small" concerned={scrollProgress > 0.38} />
                </div>

                {/* Flank 2 (Far Left Low) */}
                <div
                  className="absolute -left-28 sm:-left-36 bottom-12 transition-all duration-200"
                  style={{
                    opacity: sideFlank2 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.2 + sideFlank2 * 0.6}) translateY(${(1 - sideFlank2) * 16}px)`,
                  }}
                >
                  <SkinCellCreature size={48} concerned={scrollProgress > 0.38} />
                </div>

                {/* CENTRAL CELL */}
                <div
                  className="transition-all duration-200"
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
                    showExclamation={false}
                    concerned={scrollProgress >= 0.38}
                  />
                </div>

                {/* Flank 3 (Right) */}
                <div
                  className="absolute -right-16 sm:-right-24 bottom-4 transition-all duration-200"
                  style={{
                    opacity: sideFlank1 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.3 + sideFlank1 * 0.7}) translateY(${(1 - sideFlank1) * 20}px)`,
                  }}
                >
                  <SkinCellCreature size="small" concerned={scrollProgress > 0.38} />
                </div>

                {/* Flank 4 (Far Right Low) */}
                <div
                  className="absolute -right-28 sm:-right-36 bottom-12 transition-all duration-200"
                  style={{
                    opacity: sideFlank2 * (1 - range(scrollProgress, 0.55, 0.61)),
                    transform: `scale(${0.2 + sideFlank2 * 0.6}) translateY(${(1 - sideFlank2) * 16}px)`,
                  }}
                >
                  <SkinCellCreature size={50} concerned={scrollProgress > 0.38} />
                </div>
              </div>

              {/* 3. SCENE 3: 4 CORRELATION BADGES */}
              <div
                className="absolute inset-0 pointer-events-none z-30"
                style={{ opacity: scene3Opacity }}
              >
                {/* Pill 1: Stress */}
                <div
                  className="absolute top-4 left-0 sm:left-6 transition-transform duration-200"
                  style={{
                    transform: `translate(${(1 - stressPill) * -25}px, ${(1 - stressPill) * -12}px)`,
                    opacity: stressPill,
                  }}
                >
                  <div className="bg-white px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-slate-200 shadow-2xs">
                    <div className="w-5 h-5 rounded bg-amber-50 flex items-center justify-center text-amber-700">
                      <Zap className="w-3 h-3" />
                    </div>
                    <div className="text-left text-xs font-medium text-[#193653]">
                      <span>Stress </span>
                      <span className="text-rose-600 font-mono text-[11px]">+35%</span>
                    </div>
                  </div>
                </div>

                {/* Pill 2: Sleep */}
                <div
                  className="absolute bottom-8 left-0 sm:left-8 transition-transform duration-200"
                  style={{
                    transform: `translate(${(1 - sleepPill) * -25}px, ${(1 - sleepPill) * 12}px)`,
                    opacity: sleepPill,
                  }}
                >
                  <div className="bg-white px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-slate-200 shadow-2xs">
                    <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center text-indigo-700">
                      <Moon className="w-3 h-3" />
                    </div>
                    <div className="text-left text-xs font-medium text-[#193653]">
                      <span>Sleep </span>
                      <span className="text-indigo-600 font-mono text-[11px]">5.2h</span>
                    </div>
                  </div>
                </div>

                {/* Pill 3: Mood */}
                <div
                  className="absolute top-4 right-0 sm:right-6 transition-transform duration-200"
                  style={{
                    transform: `translate(${(1 - moodPill) * 25}px, ${(1 - moodPill) * -12}px)`,
                    opacity: moodPill,
                  }}
                >
                  <div className="bg-white px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-slate-200 shadow-2xs">
                    <div className="w-5 h-5 rounded bg-rose-50 flex items-center justify-center text-rose-600">
                      <Smile className="w-3 h-3" />
                    </div>
                    <div className="text-left text-xs font-medium text-[#193653]">
                      <span>Mood rating </span>
                      <span className="text-slate-500 font-mono text-[11px]">4/10</span>
                    </div>
                  </div>
                </div>

                {/* Pill 4: Daily Habits */}
                <div
                  className="absolute bottom-6 right-0 sm:right-8 transition-transform duration-200"
                  style={{
                    transform: `translate(${(1 - habitsPill) * 25}px, ${(1 - habitsPill) * 12}px)`,
                    opacity: habitsPill,
                  }}
                >
                  <div className="bg-white px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-slate-200 shadow-2xs">
                    <div className="w-5 h-5 rounded bg-teal-50 flex items-center justify-center text-teal-700">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div className="text-left text-xs font-medium text-[#193653]">
                      <span>Hydration </span>
                      <span className="text-teal-700 font-mono text-[11px]">1.8L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. SCENE 4: SMARTPHONE & SCAN */}
              <div
                className="absolute z-35 transition-all duration-200 flex items-center justify-center"
                style={{
                  opacity: phoneOpacity,
                  transform: `translateY(${phoneTranslateY}px)`,
                  pointerEvents: phoneOpacity > 0.4 ? 'auto' : 'none',
                }}
              >
                <PhoneScanner onScanComplete={() => setIsReportOpen(true)} />
              </div>

              {/* 5. SCENE 5: DOCTOR & DERMORA REPORT CARD */}
              <div
                className="absolute inset-0 z-40 flex items-center justify-center gap-3 sm:gap-4 transition-all duration-200"
                style={{
                  opacity: scene5Opacity,
                  transform: `translateY(${scene5TranslateY}px)`,
                  pointerEvents: scene5Opacity > 0.4 ? 'auto' : 'none',
                }}
              >
                {/* Peaceful Mascot on Left */}
                <div className="flex flex-col items-center">
                  <MascotPeaceful size={135} />
                  <span className="mt-1 text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Patient Solace
                  </span>
                </div>

                {/* Hairline Flow Arrow 1 */}
                <div className="hidden sm:block w-5 border-t border-slate-300" />

                {/* Dermora Report Card in Center */}
                <div
                  className="w-full max-w-[210px] cursor-pointer"
                  onClick={() => setIsReportOpen(true)}
                >
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-left">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-[#193653]" />
                        <span className="text-[11px] font-medium text-[#193653]">Clinical report</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        Verified
                      </span>
                    </div>

                    <div className="my-2 rounded-lg bg-slate-50 p-1.5 flex items-center justify-center border border-slate-200/60">
                      <div className="scale-60 -my-2">
                        <SkinCellCreature size={50} />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[10px] font-mono text-[#193653]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Erythema index</span>
                        <span className="text-amber-700 font-medium">Mild (32%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-sm overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-sm w-[32%]" />
                      </div>
                      <div className="pt-1 text-[9px] font-sans font-medium text-teal-700 flex items-center justify-center space-x-1">
                        <span>View complete triage</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hairline Flow Arrow 2 */}
                <div className="hidden sm:block w-5 border-t border-slate-300" />

                {/* Illustrated Dermatologist on Right */}
                <div className="flex flex-col items-center">
                  <DoctorIllustration size={150} />
                  <span className="mt-1 text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Dr. Henderson
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* DELICATE WAVE SKIN SURFACE AT BOTTOM */}
        <div className="relative w-full z-15 -mb-2">
          <SkinSurface variant="hero" />
        </div>

        {/* Calm Scroll Cue (Visible only on hero) */}
        <div
          className="relative z-30 mx-auto -mt-4 pb-2 flex flex-col items-center space-y-1 transition-opacity duration-200"
          style={{ opacity: scene1Opacity }}
        >
          <span className="text-[10px] font-mono text-slate-500">
            Scroll to explore progression
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Clinical Analysis Report Modal */}
      <AnalysisReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

export default ScrollExperience;
