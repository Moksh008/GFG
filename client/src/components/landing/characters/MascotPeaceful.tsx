import React from 'react';
import { motion } from 'framer-motion';

interface MascotPeacefulProps {
  className?: string;
  size?: number;
}

export const MascotPeaceful: React.FC<MascotPeacefulProps> = ({
  className = '',
  size = 200,
}) => {
  return (
    <motion.div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size * 0.95 }}
      animate={{
        y: [0, -6, 0],
        scaleX: [1, 1.02, 0.99, 1],
        scaleY: [1, 0.98, 1.01, 1],
      }}
      transition={{
        duration: 4.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Floor ambient shadow */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-6 rounded-full blur-md opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(25, 54, 83, 0.35) 0%, rgba(184, 208, 228, 0) 70%)',
          transform: 'translateX(-50%) scaleY(0.4)',
        }}
      />

      <svg
        viewBox="0 0 280 270"
        className="w-full h-full overflow-visible drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="peacefulCellGrad" cx="36%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="22%" stopColor="#E6F2FC" />
            <stop offset="55%" stopColor="#BCD5E9" />
            <stop offset="80%" stopColor="#A4C4DC" />
            <stop offset="100%" stopColor="#87ABC8" />
          </radialGradient>

          {/* Warm Glowing Heart */}
          <radialGradient id="peacefulHeartGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF1F2" />
            <stop offset="35%" stopColor="#FDA4AF" />
            <stop offset="70%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#BE123C" />
          </radialGradient>

          <filter id="heartSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Organic rounded cellular body (NO pointed top) */}
        <path
          d="M140 38
             C185 36, 225 64, 232 110
             C238 152, 226 195, 202 228
             C180 255, 142 260, 108 252
             C72 245, 50 215, 48 172
             C46 128, 66 75, 100 48
             C112 40, 126 38, 140 38 Z"
          fill="url(#peacefulCellGrad)"
        />

        {/* Rounded dome top highlight */}
        <ellipse cx="138" cy="50" rx="36" ry="10" fill="#FFFFFF" opacity="0.65" />

        {/* Both little arms resting softly on sides */}
        <path d="M58 155 C46 160, 42 178, 54 186 C64 192, 75 180, 72 168 Z" fill="url(#peacefulCellGrad)" />
        <path d="M222 155 C234 160, 238 178, 226 186 C216 192, 205 180, 208 168 Z" fill="url(#peacefulCellGrad)" />

        {/* Relaxed / Peaceful Closed Curved Eyes (^_^) */}
        <path
          d="M106 122 Q115 114 124 122"
          stroke="#152B42"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M152 122 Q161 114 170 122"
          stroke="#152B42"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gentle smiling mouth */}
        <path
          d="M134 135 Q138 140 142 135"
          stroke="#152B42"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Soft pink blush */}
        <ellipse cx="98" cy="132" rx="7.5" ry="4" fill="#FDA4AF" opacity="0.6" />
        <ellipse cx="178" cy="132" rx="7.5" ry="4" fill="#FDA4AF" opacity="0.6" />

        {/* Glowing Heart at center of chest */}
        <g id="glowing-heart" transform="translate(138, 175)">
          <circle r="30" fill="#FECDD3" opacity="0.35" className="animate-ping" style={{ animationDuration: '3.2s' }} />
          <path
            d="M0 -4
               C-7 -16, -24 -10, -22 4
               C-20 16, 0 28, 0 28
               C0 28, 20 16, 22 4
               C24 -10, 7 -16, 0 -4 Z"
            fill="url(#peacefulHeartGlow)"
            filter="url(#heartSoftGlow)"
            className="animate-pulse"
            style={{ animationDuration: '2.2s' }}
          />
          <ellipse cx="-7" cy="2" rx="3.5" ry="2" transform="rotate(-30 -7 2)" fill="#FFFFFF" opacity="0.8" />
        </g>
      </svg>
    </motion.div>
  );
};
