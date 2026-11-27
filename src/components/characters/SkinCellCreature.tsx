import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type CreatureSize = 'small' | 'medium' | 'large';

interface SkinCellCreatureProps {
  className?: string;
  size?: CreatureSize | number;
  concerned?: boolean;
  mischievous?: boolean;
  showExclamation?: boolean;
  delay?: number;
}

export const SkinCellCreature: React.FC<SkinCellCreatureProps> = ({
  className = '',
  size = 'small',
  concerned = false,
  mischievous = false,
  showExclamation = false,
  delay = 0,
}) => {
  // Canonical sizes matching specification
  const sizeMap: Record<CreatureSize, number> = {
    small: 54,    // 45-60px
    medium: 105,  // 90-120px
    large: 190,   // 170-210px
  };

  const actualWidth = typeof size === 'number' ? size : sizeMap[size];
  const actualHeight = actualWidth * 0.82;

  const [isBlinking, setIsBlinking] = useState(false);

  // Natural occasional blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500 + Math.random() * 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: [0, -5, 0],
        x: [0, 2, -1, 0],
        scaleX: [1, 1.03, 0.98, 1],
        scaleY: [1, 0.97, 1.02, 1],
      }}
      transition={{
        scale: { duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] },
        opacity: { duration: 0.4, delay },
        y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay },
        x: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay },
        scaleX: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay },
        scaleY: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      className={`relative inline-block select-none ${className}`}
      style={{ width: actualWidth, height: actualHeight }}
    >
      {/* Exclamation marks when surprised or alert */}
      {showExclamation && (
        <motion.div
          className="absolute -top-5 right-1 flex space-x-0.5 pointer-events-none z-20"
          animate={{ y: [0, -3.5, 0], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <span className="text-[#8873B9] font-black text-xs font-sans drop-shadow-xs">!</span>
          <span className="text-[#8873B9] font-black text-sm font-sans drop-shadow-xs -translate-y-0.5">!</span>
        </motion.div>
      )}

      {/* Floor soft ambient shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-3.5 rounded-full blur-xs opacity-35 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(136, 115, 185, 0.5) 0%, rgba(184, 208, 228, 0) 70%)',
          transform: 'translateX(-50%) scaleY(0.4)',
        }}
      />

      <svg
        viewBox="0 0 200 160"
        className="w-full h-full overflow-visible drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Soft Pastel Purple / Lavender Clay Gradient */}
          <radialGradient id="cuteCellGrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#EADEFC" />
            <stop offset="55%" stopColor="#C4B5E0" />
            <stop offset="80%" stopColor="#9D88C7" />
            <stop offset="100%" stopColor="#7E65AE" />
          </radialGradient>

          {/* Soft Rounded Nubs / Protrusions Gradient */}
          <radialGradient id="nubSoftGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F2EBFA" />
            <stop offset="65%" stopColor="#BBA6DE" />
            <stop offset="100%" stopColor="#957BC2" />
          </radialGradient>

          {/* Underbody Soft Depth */}
          <linearGradient id="creatureDepthUnder" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#483170" stopOpacity="0" />
            <stop offset="100%" stopColor="#483170" stopOpacity="0.22" />
          </linearGradient>

          {/* Large Friendly Eye Pupil Gradient */}
          <radialGradient id="creatureEyePupil" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2E1C44" />
            <stop offset="100%" stopColor="#190F28" />
          </radialGradient>
        </defs>

        {/* --- TINY ROUNDED PROTRUSIONS / SOFT CELLULAR LOBES (NO sharp spikes!) --- */}
        <g id="rounded-lobes">
          {/* Top-left rounded lobe */}
          <ellipse cx="64" cy="46" rx="14" ry="12" transform="rotate(-20 64 46)" fill="url(#nubSoftGrad)" />
          {/* Crown center rounded lobe */}
          <ellipse cx="100" cy="38" rx="16" ry="13" fill="url(#nubSoftGrad)" />
          {/* Top-right rounded lobe */}
          <ellipse cx="136" cy="46" rx="14" ry="12" transform="rotate(20 136 46)" fill="url(#nubSoftGrad)" />
          {/* Left cheek soft nub */}
          <ellipse cx="40" cy="80" rx="12" ry="11" transform="rotate(-30 40 80)" fill="url(#nubSoftGrad)" />
          {/* Right cheek soft nub */}
          <ellipse cx="160" cy="80" rx="12" ry="11" transform="rotate(30 160 80)" fill="url(#nubSoftGrad)" />
        </g>

        {/* --- PLUMP, ROUNDED SQUISHY CELL BODY --- */}
        <g id="squishy-cell-body">
          <ellipse
            cx="100"
            cy="95"
            rx="66"
            ry="50"
            fill="url(#cuteCellGrad)"
          />

          {/* Top dome specular highlight */}
          <ellipse
            cx="98"
            cy="68"
            rx="40"
            ry="18"
            fill="#FFFFFF"
            opacity="0.5"
          />
          <circle cx="95" cy="62" r="5" fill="#FFFFFF" opacity="0.75" />

          {/* Underbody depth */}
          <ellipse
            cx="100"
            cy="134"
            rx="48"
            ry="12"
            fill="url(#creatureDepthUnder)"
          />

          {/* Tiny Cute Rounded Feet */}
          <ellipse cx="74" cy="142" rx="12" ry="7" fill="#9D88C7" />
          <ellipse cx="126" cy="142" rx="12" ry="7" fill="#9D88C7" />

          {/* Tiny Soft Arms */}
          <ellipse cx="48" cy="104" rx="8" ry="6" transform="rotate(25 48 104)" fill="#B39DDB" />
          <ellipse cx="152" cy="104" rx="8" ry="6" transform="rotate(-25 152 104)" fill="#B39DDB" />
        </g>

        {/* --- LARGE EXPRESSIVE EYES & SOFT CHEEKS (Adorable, NOT aggressive!) --- */}
        <g id="creature-face">
          {/* Eyebrows */}
          <path
            d={concerned ? "M68 76 Q78 80 88 77" : mischievous ? "M68 74 Q78 72 88 77" : "M70 78 Q80 74 88 78"}
            stroke="#5E458C"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={concerned ? "M132 76 Q122 80 112 77" : mischievous ? "M132 77 Q122 72 112 74" : "M130 78 Q120 74 112 78"}
            stroke="#5E458C"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes: Blinking vs Open */}
          {isBlinking ? (
            <g>
              <path d="M72 95 Q80 102 88 95" stroke="#2E1C44" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M112 95 Q120 102 128 95" stroke="#2E1C44" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g>
              {/* Left Eye */}
              <ellipse cx="80" cy="94" rx="11" ry="13" fill="url(#creatureEyePupil)" />
              <circle cx="77" cy="89" r="4.2" fill="#FFFFFF" />
              <circle cx="83" cy="99" r="2" fill="#FFFFFF" opacity="0.9" />

              {/* Right Eye */}
              <ellipse cx="120" cy="94" rx="11" ry="13" fill="url(#creatureEyePupil)" />
              <circle cx="117" cy="89" r="4.2" fill="#FFFFFF" />
              <circle cx="123" cy="99" r="2" fill="#FFFFFF" opacity="0.9" />
            </g>
          )}

          {/* Soft Pink Cheeks */}
          <ellipse cx="62" cy="106" rx="8" ry="5" fill="#F472B6" opacity="0.5" />
          <ellipse cx="138" cy="106" rx="8" ry="5" fill="#F472B6" opacity="0.5" />

          {/* Cute Little Mouth */}
          {concerned ? (
            <ellipse cx="100" cy="112" rx="4" ry="4.5" fill="#4A316E" />
          ) : mischievous ? (
            <path d="M94 109 Q100 116 107 109" stroke="#4A316E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M95 110 Q100 115 105 110" stroke="#4A316E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}
        </g>
      </svg>
    </motion.div>
  );
};

export default SkinCellCreature;
