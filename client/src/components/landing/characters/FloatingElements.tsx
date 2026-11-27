import React from 'react';
import { motion } from 'framer-motion';

// --- 3D SKIN LAYERS CAKE WITH DROPLET (Icon from Hero Top-Left) ---
export const SkinLayersCake: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 130,
}) => {
  return (
    <motion.div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -8, 0],
        rotate: [0, 2, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full overflow-visible drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="layerTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4ED" />
            <stop offset="100%" stopColor="#FBD3BE" />
          </linearGradient>
          <linearGradient id="layerMidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8C3A9" />
            <stop offset="100%" stopColor="#E59D7E" />
          </linearGradient>
          <linearGradient id="layerBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E28C69" />
            <stop offset="100%" stopColor="#C96E49" />
          </linearGradient>
          <radialGradient id="cakeDropGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#D2E8F8" />
            <stop offset="85%" stopColor="#8AC0E8" />
            <stop offset="100%" stopColor="#519FD6" />
          </radialGradient>
        </defs>

        {/* Isometric 3D Layer 3 (Deep dermis / Subcutis) */}
        <g id="layer-3" transform="translate(0, 32)">
          {/* Top surface */}
          <path d="M80 65 L135 90 L80 115 L25 90 Z" fill="url(#layerBottomGrad)" />
          {/* Left extrusion */}
          <path d="M25 90 L80 115 L80 130 L25 105 Z" fill="#B35E3B" />
          {/* Right extrusion */}
          <path d="M80 115 L135 90 L135 105 L80 130 Z" fill="#9C4C2B" />
        </g>

        {/* Isometric 3D Layer 2 (Reticular dermis) */}
        <g id="layer-2" transform="translate(0, 16)">
          {/* Top surface */}
          <path d="M80 50 L135 75 L80 100 L25 75 Z" fill="url(#layerMidGrad)" />
          {/* Left extrusion */}
          <path d="M25 75 L80 100 L80 115 L25 90 Z" fill="#CF8262" />
          {/* Right extrusion */}
          <path d="M80 100 L135 75 L135 90 L80 115 Z" fill="#BA6E4F" />
        </g>

        {/* Isometric 3D Layer 1 (Epidermis top) */}
        <g id="layer-1">
          {/* Top surface */}
          <path d="M80 35 L135 60 L80 85 L25 60 Z" fill="url(#layerTopGrad)" />
          {/* Left extrusion */}
          <path d="M25 60 L80 85 L80 100 L25 75 Z" fill="#E8B298" />
          {/* Right extrusion */}
          <path d="M80 85 L135 60 L135 75 L80 100 Z" fill="#D3987C" />

          {/* Dermal pore texture dots on top */}
          <ellipse cx="65" cy="55" rx="3" ry="1.8" fill="#F8BC9E" opacity="0.6" />
          <ellipse cx="85" cy="50" rx="3.5" ry="2" fill="#F8BC9E" opacity="0.6" />
          <ellipse cx="105" cy="65" rx="2.5" ry="1.5" fill="#F8BC9E" opacity="0.6" />
        </g>

        {/* Translucent water droplet sitting on top */}
        <g id="top-droplet" transform="translate(80, 42)">
          <path
            d="M0 -22
               C6 -12, 14 -4, 14 5
               C14 13, 8 18, 0 18
               C-8 18, -14 13, -14 5
               C-14 -4, -6 -12, 0 -22 Z"
            fill="url(#cakeDropGrad)"
            opacity="0.9"
          />
          {/* Specular glare */}
          <ellipse cx="-4" cy="-3" rx="3.5" ry="7" transform="rotate(-20 -4 -3)" fill="#FFFFFF" opacity="0.8" />
        </g>
      </svg>
    </motion.div>
  );
};

// --- TRANSLUCENT WATER DROPLET ---
export const WaterDroplet: React.FC<{ size?: number; className?: string; delay?: number }> = ({
  size = 48,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      className={`relative inline-block pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.2 }}
      animate={{
        y: [0, -12, 0],
        rotate: [0, 4, -3, 0],
      }}
      transition={{
        duration: 4.2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 60 72" className="w-full h-full overflow-visible" fill="none">
        <defs>
          <radialGradient id={`dropGrad-${size}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#D6EEFC" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#96C7EB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4A8BC7" stopOpacity="0.75" />
          </radialGradient>
        </defs>
        <path
          d="M30 4
             C38 18, 52 32, 52 46
             C52 58, 42 68, 30 68
             C18 68, 8 58, 8 46
             C8 32, 22 18, 30 4 Z"
          fill={`url(#dropGrad-${size})`}
        />
        {/* Curved highlight */}
        <path
          d="M24 16 C30 20, 36 26, 38 34"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="20" cy="48" r="3" fill="#FFFFFF" opacity="0.6" />
      </svg>
    </motion.div>
  );
};

// --- DNA DOUBLE HELIX STRUCTURE ---
export const DnaHelix: React.FC<{ className?: string; width?: number; height?: number }> = ({
  className = '',
  width = 160,
  height = 90,
}) => {
  return (
    <div className={`pointer-events-none select-none opacity-40 ${className}`} style={{ width, height }}>
      <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8D0E4" />
            <stop offset="50%" stopColor="#DAD9F5" />
            <stop offset="100%" stopColor="#B8D0E4" />
          </linearGradient>
        </defs>
        {/* Strand 1 */}
        <path
          d="M10 50 Q35 15, 60 50 T110 50 T160 50 T200 50"
          stroke="url(#dnaGrad)"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Strand 2 (Opposite phase) */}
        <path
          d="M10 50 Q35 85, 60 50 T110 50 T160 50 T200 50"
          stroke="url(#dnaGrad)"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Rungs */}
        <line x1="25" y1="32" x2="25" y2="68" stroke="#DAD9F5" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="50" y1="45" x2="50" y2="55" stroke="#DAD9F5" strokeWidth="2" />
        <line x1="75" y1="68" x2="75" y2="32" stroke="#DAD9F5" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="100" y1="45" x2="100" y2="55" stroke="#DAD9F5" strokeWidth="2" />
        <line x1="125" y1="32" x2="125" y2="68" stroke="#DAD9F5" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="150" y1="45" x2="150" y2="55" stroke="#DAD9F5" strokeWidth="2" />
        <line x1="175" y1="68" x2="175" y2="32" stroke="#DAD9F5" strokeWidth="2" strokeDasharray="3 3" />

        {/* Nodes */}
        <circle cx="25" cy="32" r="3" fill="#FFFFFF" />
        <circle cx="25" cy="68" r="3" fill="#8873B9" />
        <circle cx="75" cy="32" r="3" fill="#8873B9" />
        <circle cx="75" cy="68" r="3" fill="#FFFFFF" />
        <circle cx="125" cy="32" r="3" fill="#FFFFFF" />
        <circle cx="125" cy="68" r="3" fill="#8873B9" />
      </svg>
    </div>
  );
};

// --- MOLECULAR RING / CELLULAR STRUCTURE ---
export const MolecularStructure: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none select-none opacity-30 ${className}`}>
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none">
        <polygon
          points="60,20 90,37 90,73 60,90 30,73 30,37"
          stroke="#7BA6CE"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="60" cy="20" r="4" fill="#FFFFFF" stroke="#7BA6CE" strokeWidth="2" />
        <circle cx="90" cy="37" r="4" fill="#FFFFFF" stroke="#7BA6CE" strokeWidth="2" />
        <circle cx="90" cy="73" r="4" fill="#FFFFFF" stroke="#7BA6CE" strokeWidth="2" />
        <circle cx="60" cy="90" r="4" fill="#FFFFFF" stroke="#7BA6CE" strokeWidth="2" />
        <circle cx="30" cy="73" r="4" fill="#FFFFFF" stroke="#7BA6CE" strokeWidth="2" />
        <circle cx="30" cy="37" r="4" fill="#FFFFFF" stroke="#7BA6CE" strokeWidth="2" />
        <circle cx="60" cy="55" r="8" fill="#B8D0E4" opacity="0.5" />
      </svg>
    </div>
  );
};
