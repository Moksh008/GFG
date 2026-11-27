import React from 'react';
import { motion } from 'framer-motion';

interface DoctorIllustrationProps {
  className?: string;
  size?: number;
}

export const DoctorIllustration: React.FC<DoctorIllustrationProps> = ({
  className = '',
  size = 230,
}) => {
  return (
    <motion.div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size * 1.05 }}
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 3.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Floor soft shadow */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-5 rounded-full blur-md opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(25, 54, 83, 0.4) 0%, rgba(184, 208, 228, 0) 70%)',
          transform: 'translateX(-50%) scaleY(0.4)',
        }}
      />

      <svg
        viewBox="0 0 240 260"
        className="w-full h-full overflow-visible drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Skin Clay Tone */}
          <radialGradient id="docSkinGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFF2EB" />
            <stop offset="60%" stopColor="#FBD3C0" />
            <stop offset="100%" stopColor="#E9B299" />
          </radialGradient>

          {/* Hair Clay Gradient */}
          <radialGradient id="hairGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#604030" />
            <stop offset="60%" stopColor="#3E2417" />
            <stop offset="100%" stopColor="#25140B" />
          </radialGradient>

          {/* White Lab Coat Gradient */}
          <linearGradient id="labCoatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Stethoscope Rubber & Metal */}
          <linearGradient id="stethGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Tablet Screen */}
          <linearGradient id="tabletScreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
        </defs>

        {/* --- HAIR (BACK) --- */}
        <path
          d="M75 80 C60 110, 58 145, 68 165 C76 150, 80 120, 84 95 Z"
          fill="url(#hairGrad)"
        />
        <path
          d="M165 80 C180 110, 182 145, 172 165 C164 150, 160 120, 156 95 Z"
          fill="url(#hairGrad)"
        />

        {/* --- BODY & LAB COAT --- */}
        {/* Inner Shirt (Teal Scrubs) */}
        <path
          d="M100 130 L120 155 L140 130 L140 170 L100 170 Z"
          fill="#0D9488"
        />

        {/* Lab Coat Shoulders & Torso */}
        <path
          d="M80 135
             C80 135, 95 125, 120 125
             C145 125, 160 135, 160 135
             L182 240
             C182 240, 140 248, 120 248
             C100 248, 58 240, 58 240
             L80 135 Z"
          fill="url(#labCoatGrad)"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Lab Coat Lapels */}
        <path
          d="M95 126 L108 178 L84 185 L76 142 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />
        <path
          d="M145 126 L132 178 L156 185 L164 142 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />

        {/* Stethoscope Tubing around neck */}
        <path
          d="M96 128 C96 155, 102 188, 118 192 C134 188, 140 155, 140 128"
          stroke="url(#stethGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Stethoscope Chest Piece */}
        <circle cx="118" cy="194" r="6" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
        <circle cx="118" cy="194" r="3" fill="#E2E8F0" />

        {/* --- HEAD & NECK --- */}
        {/* Neck */}
        <path d="M108 110 L108 135 L132 135 L132 110 Z" fill="url(#docSkinGrad)" />
        {/* Neck shadow */}
        <path d="M108 114 Q120 122 132 114 L132 120 Q120 128 108 120 Z" fill="#DFA389" opacity="0.6" />

        {/* Head */}
        <ellipse cx="120" cy="85" rx="36" ry="40" fill="url(#docSkinGrad)" />

        {/* Ears */}
        <ellipse cx="84" cy="88" rx="6" ry="9" fill="url(#docSkinGrad)" />
        <ellipse cx="156" cy="88" rx="6" ry="9" fill="url(#docSkinGrad)" />

        {/* Front Hair / Bangs */}
        <path
          d="M84 75
             C84 45, 110 38, 128 40
             C155 42, 162 60, 160 80
             C155 70, 142 66, 126 68
             C112 70, 96 82, 84 75 Z"
          fill="url(#hairGrad)"
        />

        {/* Hair Bun / Ponytail on top */}
        <ellipse cx="120" cy="38" rx="16" ry="12" fill="url(#hairGrad)" />
        <ellipse cx="114" cy="34" rx="8" ry="4" fill="#8D5B41" opacity="0.5" />

        {/* --- FACE DETAILS --- */}
        {/* Gentle Eyes */}
        <ellipse cx="106" cy="86" rx="4.5" ry="5.5" fill="#1E293B" />
        <circle cx="105" cy="84" r="1.8" fill="#FFFFFF" />

        <ellipse cx="134" cy="86" rx="4.5" ry="5.5" fill="#1E293B" />
        <circle cx="133" cy="84" r="1.8" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M100 78 Q106 74 112 77" stroke="#3E2417" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M128 77 Q134 74 140 78" stroke="#3E2417" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Subtle cute nose */}
        <path d="M119 90 Q120 94 122 93" stroke="#DFA389" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Friendly smile */}
        <path d="M112 100 Q120 107 128 100" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Soft Blush */}
        <ellipse cx="98" cy="94" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.6" />
        <ellipse cx="142" cy="94" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.6" />

        {/* --- ARMS & TABLET / CLIPBOARD --- */}
        {/* Left Arm holding tablet */}
        <path
          d="M60 170 C52 195, 62 215, 82 215 L95 210 L80 178 Z"
          fill="url(#labCoatGrad)"
        />

        {/* Digital Tablet / Clipboard */}
        <g transform="translate(68, 175) rotate(-10)">
          <rect x="0" y="0" width="55" height="70" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <rect x="4" y="4" width="47" height="62" rx="4" fill="url(#tabletScreen)" />

          {/* Mini chart & lines on tablet screen */}
          <rect x="8" y="10" width="22" height="4" rx="2" fill="#0284C7" />
          <rect x="8" y="18" width="38" height="2.5" rx="1" fill="#94A3B8" />
          <rect x="8" y="24" width="30" height="2.5" rx="1" fill="#94A3B8" />

          {/* Mini pulse waveform on tablet */}
          <path
            d="M8 44 L16 44 L20 36 L24 50 L28 40 L32 44 L44 44"
            stroke="#0EA5E9"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Home indicator pill */}
          <circle cx="27.5" cy="61" r="2.5" fill="#64748B" />
        </g>

        {/* Doctor's hand holding tablet */}
        <ellipse cx="88" cy="208" rx="7" ry="5" fill="url(#docSkinGrad)" />
      </svg>
    </motion.div>
  );
};
