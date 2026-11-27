import React from 'react';

interface HeroImageIllustrationProps {
  className?: string;
  onExplore?: () => void;
}

export const HeroImageIllustration: React.FC<HeroImageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative w-full max-w-[360px] rounded-2xl bg-[#FAF8F4]/95 border border-slate-200/90 shadow-lg overflow-hidden ${className}`}
    >
      {/* Window Title Bar */}
      <div className="px-3.5 py-2.5 bg-white/80 border-b border-slate-200/70 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300/90" />
        </div>
        <span className="text-[11px] font-medium text-[#193653]/80 select-none">
          Dermora
        </span>
        <div className="w-8" />
      </div>

      {/* Window Content */}
      <div className="relative p-4 flex items-center justify-center bg-gradient-to-b from-[#FAF8F4] to-[#F3F0EA]/60">
        <img
          src="/hero-illustration.jpg"
          alt="Dermatologist examining skin barrier changes with magnifying lens"
          className="w-full h-auto object-contain mix-blend-multiply select-none brightness-[1.03] contrast-[1.04]"
          style={{
            maskImage:
              'radial-gradient(ellipse 88% 88% at 50% 50%, black 68%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 88% 88% at 50% 50%, black 68%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
};

export default HeroImageIllustration;
