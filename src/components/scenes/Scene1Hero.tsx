import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, Sparkles } from 'lucide-react';
import { MascotHero } from '../characters/MascotHero';
import { SkinCreature } from '../characters/SkinCreature';
import { SkinSurface } from '../characters/SkinSurface';
import { SkinLayersCake, WaterDroplet, DnaHelix, MolecularStructure } from '../characters/FloatingElements';

interface Scene1HeroProps {
  onStartJourney?: () => void;
  onWatchStory?: () => void;
}

export const Scene1Hero: React.FC<Scene1HeroProps> = ({
  onStartJourney,
  onWatchStory,
}) => {
  return (
    <section
      id="scene-hero"
      className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-8 overflow-hidden bg-gradient-to-b from-[#DCEAF5]/50 via-[#FAF8F4] to-[#FAF8F4]"
    >
      {/* Background Soft Organic Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#B8D0E4]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#DAD9F5]/35 blur-3xl pointer-events-none" />

      {/* Floating Decorative Elements on edges */}
      <div className="absolute top-28 left-6 md:left-14 z-10 hidden sm:block">
        <SkinLayersCake size={110} />
      </div>

      <div className="absolute top-36 left-48 hidden lg:block">
        <MolecularStructure />
      </div>

      <div className="absolute top-28 right-24 xl:right-48 hidden md:block">
        <DnaHelix width={180} height={100} />
      </div>

      <div className="absolute top-1/2 left-10 hidden md:block">
        <WaterDroplet size={38} delay={0.4} />
      </div>

      <div className="absolute top-1/3 right-16 hidden lg:block">
        <WaterDroplet size={46} delay={1.2} />
      </div>

      {/* --- HERO CONTENT GRID --- */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-20 flex-1 my-auto">
        {/* Left Column: Headlines & CTA (Upper-left quadrant) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left pt-6 lg:pt-0"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-white/90 shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              Skin • Mind • Lifestyle
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#193653] tracking-tight leading-[1.15] mb-5">
            A small skin concern might{' '}
            <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#93C5FD]/60 decoration-wavy decoration-2">
              not stay small...
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#193653]/75 leading-relaxed max-w-lg mb-8 font-normal">
            Skin changes often start subtle, but can grow, spread and flare up — especially when stress, sleep and daily life are out of balance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={onStartJourney}
              className="group px-7 py-3.5 rounded-full bg-[#193653] hover:bg-[#234A70] text-white text-sm font-bold shadow-lg glow-navy flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onWatchStory}
              className="px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#193653] text-sm font-semibold border border-white shadow-md flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#DCEAF5] flex items-center justify-center text-[#193653]">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </div>
              <span>Watch the Story</span>
            </button>
          </div>
        </motion.div>

        {/* Right Column: Main Mascot & Tiny Creature Composition */}
        <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
          {/* Main Mascot with Magnifying Glass */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="relative z-20 -translate-x-4 lg:-translate-x-8"
          >
            <MascotHero size={340} />
          </motion.div>

          {/* Tiny Purple Creature perched nearby on the skin */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute bottom-16 sm:bottom-20 right-10 sm:right-24 z-20"
          >
            <SkinCreature
              variant="tiny"
              size={56}
              showExclamation={true}
              agitated={false}
            />
          </motion.div>
        </div>
      </div>

      {/* Undulating Skin Surface across the lower third */}
      <div className="relative w-full z-10 -mt-16 sm:-mt-24">
        <SkinSurface variant="hero" />
      </div>

      {/* Bouncing Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-30 mx-auto -mt-6 flex flex-col items-center space-y-1.5 cursor-pointer"
        onClick={() => {
          document.getElementById('scene-multiplies')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-[11px] font-semibold tracking-wider text-[#193653]/70 uppercase">
          Scroll to see the journey
        </span>
        <div className="w-7 h-7 rounded-full bg-white/90 border border-white shadow-sm flex items-center justify-center text-[#193653]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </motion.div>
    </section>
  );
};
