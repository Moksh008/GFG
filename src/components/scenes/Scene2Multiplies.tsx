import React from 'react';
import { SkinCreature } from '../characters/SkinCreature';
import { SkinSurface } from '../characters/SkinSurface';
import { WaterDroplet, MolecularStructure } from '../characters/FloatingElements';

interface Scene2MultipliesProps {
  progress?: number; // 0 to 1 scroll progress from parent GSAP trigger
}

export const Scene2Multiplies: React.FC<Scene2MultipliesProps> = ({
  progress = 0,
}) => {
  // Interpolations based on progress:
  // 0 - 0.20: Tiny creature grows and moves toward center
  const centerScale = Math.min(1 + progress * 0.9, 1.8);
  const centerTranslateX = (1 - Math.min(progress / 0.25, 1)) * 40;

  // 0.20 - 0.45: Side creatures 1 & 2 enter
  const side1Progress = Math.min(Math.max((progress - 0.15) / 0.25, 0), 1);
  const side2Progress = Math.min(Math.max((progress - 0.22) / 0.25, 0), 1);

  // 0.45 - 0.70: Side creatures 3 & 4 enter
  const side3Progress = Math.min(Math.max((progress - 0.42) / 0.25, 0), 1);
  const side4Progress = Math.min(Math.max((progress - 0.50) / 0.25, 0), 1);

  return (
    <div
      id="scene-multiplies"
      className="relative min-h-screen w-full flex flex-col justify-between pt-20 pb-12 overflow-hidden bg-gradient-to-b from-[#FAF8F4] via-[#F4F8FC] to-[#F1F6FA]"
    >
      {/* Soft background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#DAD9F5]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-24 right-1/4 hidden md:block">
        <MolecularStructure />
      </div>
      <div className="absolute top-1/3 left-16 hidden lg:block">
        <WaterDroplet size={34} delay={0.6} />
      </div>

      {/* Main Grid Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-20 flex-1 my-auto">
        {/* Left Third: Headline & Supporting Text */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-start text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              The Build Up
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-4">
            It can grow and spread...
          </h2>

          <p className="text-base text-[#193653]/75 leading-relaxed max-w-md font-normal">
            Without the right care, what starts as a minor issue can become harder to manage as cellular friction cascades across delicate skin barriers.
          </p>

          {/* Interactive progress hint */}
          <div className="mt-6 flex items-center space-x-2 text-xs font-semibold text-[#193653]/60 bg-white/60 px-3.5 py-1.5 rounded-full border border-white">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
            <span>Multiply state: {Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* Center / Right: Dynamic Multiplying Creatures along Skin Ridge */}
        <div className="lg:col-span-7 xl:col-span-8 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
          {/* Ridge Platform Container */}
          <div className="relative w-full h-[320px] flex items-center justify-center">
            {/* Creature 1: Left Flank (Enters at 20-45%) */}
            <div
              className="absolute left-4 sm:left-12 bottom-12 transition-transform duration-300"
              style={{
                opacity: side1Progress,
                transform: `scale(${0.3 + side1Progress * 0.7}) translateY(${(1 - side1Progress) * 40}px)`,
              }}
            >
              <SkinCreature variant="small" size={68} agitated={progress > 0.6} />
            </div>

            {/* Creature 2: Far Left Low (Enters at 45-70%) */}
            <div
              className="absolute left-24 sm:left-36 bottom-20 transition-transform duration-300"
              style={{
                opacity: side3Progress,
                transform: `scale(${0.2 + side3Progress * 0.6}) translateY(${(1 - side3Progress) * 30}px)`,
              }}
            >
              <SkinCreature variant="tiny" size={50} agitated={progress > 0.7} />
            </div>

            {/* Central Dominant Creature (Grows from original tiny) */}
            <div
              className="relative z-30 transition-transform duration-300"
              style={{
                transform: `scale(${centerScale}) translateX(${centerTranslateX}px)`,
              }}
            >
              <SkinCreature
                variant={progress > 0.5 ? 'large' : 'medium'}
                size={135}
                agitated={progress > 0.4}
                showExclamation={progress > 0.6}
              />
            </div>

            {/* Creature 3: Right Flank (Enters at 20-45%) */}
            <div
              className="absolute right-12 sm:right-28 bottom-14 transition-transform duration-300"
              style={{
                opacity: side2Progress,
                transform: `scale(${0.3 + side2Progress * 0.7}) translateY(${(1 - side2Progress) * 35}px)`,
              }}
            >
              <SkinCreature variant="small" size={72} agitated={progress > 0.6} />
            </div>

            {/* Creature 4: Far Right Low (Enters at 45-70%) */}
            <div
              className="absolute right-2 sm:right-10 bottom-24 transition-transform duration-300"
              style={{
                opacity: side4Progress,
                transform: `scale(${0.2 + side4Progress * 0.6}) translateY(${(1 - side4Progress) * 30}px)`,
              }}
            >
              <SkinCreature variant="tiny" size={54} agitated={progress > 0.7} />
            </div>
          </div>
        </div>
      </div>

      {/* Undulating Ridge Skin Surface */}
      <div className="relative w-full z-10 -mt-20">
        <SkinSurface variant="ridge" />
      </div>
    </div>
  );
};
