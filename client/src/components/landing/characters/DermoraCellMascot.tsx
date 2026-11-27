import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DermoraCellMascotProps {
  className?: string;
  size?: number;
  interactive?: boolean;
  happy?: boolean;
  onClick?: () => void;
}

export const DermoraCellMascot: React.FC<DermoraCellMascotProps> = ({
  className = '',
  size = 280,
  interactive = true,
  happy = false,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth lerp state for cursor tracking
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [bodyTilt, setBodyTilt] = useState({ rotate: 0, x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Target positions stored in refs to avoid React re-render lag in rAF
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ rotate: 0, x: 0, y: 0 });
  const currentTilt = useRef({ rotate: 0, x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from mascot center
      const rawDx = (e.clientX - centerX) / (window.innerWidth / 2);
      const rawDy = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp target pupil movement (-7px to +7px)
      const clampedX = Math.max(-1, Math.min(1, rawDx)) * 7;
      const clampedY = Math.max(-1, Math.min(1, rawDy)) * 6;
      targetPos.current = { x: clampedX, y: clampedY };

      // Subtle body/head lean and tilt
      targetTilt.current = {
        rotate: Math.max(-1, Math.min(1, rawDx)) * 5, // -5 to +5 deg
        x: Math.max(-1, Math.min(1, rawDx)) * 10,
        y: Math.max(-1, Math.min(1, rawDy)) * 6,
      };
    };

    const handlePointerLeave = () => {
      targetPos.current = { x: 0, y: 0 };
      targetTilt.current = { rotate: 0, x: 0, y: 0 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    // Animation frame for buttery-smooth lerp tracking
    let animId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const tick = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.12);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.12);

      currentTilt.current.rotate = lerp(currentTilt.current.rotate, targetTilt.current.rotate, 0.08);
      currentTilt.current.x = lerp(currentTilt.current.x, targetTilt.current.x, 0.08);
      currentTilt.current.y = lerp(currentTilt.current.y, targetTilt.current.y, 0.08);

      setPupilPos({ x: currentPos.current.x, y: currentPos.current.y });
      setBodyTilt({
        rotate: currentTilt.current.rotate,
        x: currentTilt.current.x,
        y: currentTilt.current.y,
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animId);
    };
  }, [interactive]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 450);
    if (onClick) onClick();
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative inline-block select-none cursor-pointer ${className}`}
      style={{
        width: size,
        height: size * 0.98,
        transform: `translate3d(${bodyTilt.x}px, ${bodyTilt.y}px, 0) rotate(${bodyTilt.rotate}deg)`,
      }}
      animate={
        isClicked
          ? { scale: [1, 1.12, 0.95, 1], y: [0, -18, 2, 0] }
          : {
              y: [0, -8, 0],
              scaleX: [1, 1.02, 0.985, 1],
              scaleY: [1, 0.98, 1.015, 1],
            }
      }
      transition={{
        duration: isClicked ? 0.45 : 4.8,
        repeat: isClicked ? 0 : Infinity,
        ease: 'easeInOut',
      }}
      onClick={handleClick}
    >
      {/* Soft Ambient Floor Contact Shadow */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-full blur-md opacity-35 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(25, 54, 83, 0.42) 0%, rgba(184, 208, 228, 0) 70%)',
          transform: 'translateX(-50%) scaleY(0.4)',
        }}
      />

      <svg
        viewBox="0 0 320 310"
        className="w-full h-full overflow-visible drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Microscopic Cell Membrane Clay Gradient */}
          <radialGradient id="livingCellBodyGrad" cx="36%" cy="30%" r="70%" fx="30%" fy="24%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#E6F2FC" />
            <stop offset="50%" stopColor="#BBD5EA" />
            <stop offset="78%" stopColor="#9EC1DD" />
            <stop offset="92%" stopColor="#8AAECB" />
            <stop offset="100%" stopColor="#769CBA" />
          </radialGradient>

          {/* Cytoplasm Mint-Green Glowing Center Core */}
          <radialGradient id="livingCellMintGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.95" />
            <stop offset="42%" stopColor="#5EEAD4" stopOpacity="0.82" />
            <stop offset="75%" stopColor="#2DD4BF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
          </radialGradient>

          {/* Internal Organelle Gradient */}
          <radialGradient id="organelleGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#DAD9F5" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.6" />
          </radialGradient>

          {/* Membrane Surface Specular Highlights */}
          <linearGradient id="cellMembraneGloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Underbody Soft Ambient Depth */}
          <linearGradient id="cellUnderDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#193653" stopOpacity="0" />
            <stop offset="100%" stopColor="#193653" stopOpacity="0.18" />
          </linearGradient>

          {/* Eye Pupil Deep Navy Clay */}
          <radialGradient id="cellPupilGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#243E56" />
            <stop offset="60%" stopColor="#152B42" />
            <stop offset="100%" stopColor="#0E1E2F" />
          </radialGradient>

          <filter id="softMembraneGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* --- CUTE ROUNDED FEET (Peeking out beneath cell body) --- */}
        <g id="cell-feet">
          <ellipse cx="118" cy="275" rx="16" ry="10" fill="#8AAECB" />
          <ellipse cx="116" cy="273" rx="10" ry="5" fill="#BBD5EA" opacity="0.6" />
          <ellipse cx="202" cy="275" rx="16" ry="10" fill="#8AAECB" />
          <ellipse cx="200" cy="273" rx="10" ry="5" fill="#BBD5EA" opacity="0.6" />
        </g>

        {/* --- ORGANIC ROUNDED CELL MEMBRANE (Living Cell, NO teardrop top!) --- */}
        <g id="living-cell-membrane">
          {/* Plump, rounded, slightly irregular organic cell silhouette */}
          <path
            d="M160 38
               C212 36, 258 66, 266 116
               C274 162, 260 210, 235 246
               C212 276, 172 284, 134 280
               C92 275, 62 242, 58 195
               C54 144, 76 84, 114 50
               C128 41, 144 38, 160 38 Z"
            fill="url(#livingCellBodyGrad)"
          />

          {/* Internal Mint-Green Glowing Core */}
          <ellipse
            cx="160"
            cy="192"
            rx="56"
            ry="48"
            fill="url(#livingCellMintGlow)"
            className="animate-pulse"
            style={{ animationDuration: '3.8s' }}
          />
          <ellipse
            cx="160"
            cy="190"
            rx="30"
            ry="24"
            fill="#CCFBF1"
            opacity="0.85"
            filter="url(#softMembraneGlow)"
          />

          {/* --- SUBTLE INTERNAL ORGANELLES (Translucent soft clay beads inside cytoplasm) --- */}
          <g id="internal-organelles" className="opacity-75">
            {/* Organelle 1 (Upper Left vacuole) */}
            <ellipse cx="106" cy="115" rx="10" ry="8" transform="rotate(-15 106 115)" fill="url(#organelleGrad)" />
            {/* Organelle 2 (Mid-right mitochondria bead) */}
            <path
              d="M222 142 C228 140, 234 146, 230 152 C226 156, 218 154, 218 148 Z"
              fill="url(#organelleGrad)"
            />
            {/* Organelle 3 (Lower micro-vesicle) */}
            <circle cx="112" cy="226" r="6" fill="url(#organelleGrad)" opacity="0.6" />
          </g>

          {/* Top Specular Dome Gloss on Membrane */}
          <path
            d="M130 48
               C160 44, 202 48, 230 72
               C218 80, 190 78, 165 78
               C140 78, 116 82, 105 88
               C108 72, 118 58, 130 48 Z"
            fill="url(#cellMembraneGloss)"
            opacity="0.85"
          />
          <ellipse cx="156" cy="52" rx="28" ry="7" fill="#FFFFFF" opacity="0.65" />

          {/* Underbody Soft Ambient Depth Shadow */}
          <path
            d="M86 242
               C120 272, 198 274, 228 244
               C218 278, 175 284, 132 278
               C102 274, 89 256, 86 242 Z"
            fill="url(#cellUnderDepth)"
          />

          {/* Small Rounded Soft Arms */}
          {/* Left Arm */}
          <path
            d="M62 170 C44 176, 42 198, 56 206 C68 212, 78 198, 76 182 Z"
            fill="url(#livingCellBodyGrad)"
          />
          <ellipse cx="52" cy="194" rx="4" ry="5" fill="#FFFFFF" opacity="0.6" />

          {/* Right Arm */}
          <path
            d="M256 170 C274 176, 276 198, 262 206 C250 212, 240 198, 242 182 Z"
            fill="url(#livingCellBodyGrad)"
          />
          <ellipse cx="266" cy="194" rx="4" ry="5" fill="#FFFFFF" opacity="0.6" />
        </g>

        {/* --- CUTE EXPRESSIVE LIVING CELL FACE (EYES WITH SEPARATE MOVABLE PUPILS!) --- */}
        <g id="living-cell-face">
          {/* Occasional Blinking vs Open Eyes */}
          {isBlinking || happy ? (
            /* Relaxed Happy Closed Eyelids (^_^) */
            <g>
              <path d="M128 132 Q138 122 148 132" stroke="#152B42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M172 132 Q182 122 192 132" stroke="#152B42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* Open Eyes with Cursor-Tracking Pupils */
            <g>
              {/* LEFT EYE */}
              <g id="left-eye-socket">
                {/* Outer Sclera */}
                <ellipse cx="138" cy="132" rx="13" ry="15" fill="#FFFFFF" />
                <ellipse cx="138" cy="132" rx="13" ry="15" stroke="#BCD5EA" strokeWidth="1.5" fill="none" />

                {/* MOVABLE PUPIL (Follows cursor smoothly!) */}
                <g transform={`translate(${pupilPos.x}, ${pupilPos.y})`}>
                  <ellipse cx="138" cy="132" rx="8" ry="9.5" fill="url(#cellPupilGrad)" />
                  {/* Catchlights */}
                  <circle cx="135.5" cy="129" r="2.8" fill="#FFFFFF" />
                  <circle cx="140" cy="135" r="1.3" fill="#FFFFFF" opacity="0.85" />
                </g>
              </g>

              {/* RIGHT EYE */}
              <g id="right-eye-socket">
                {/* Outer Sclera */}
                <ellipse cx="182" cy="132" rx="13" ry="15" fill="#FFFFFF" />
                <ellipse cx="182" cy="132" rx="13" ry="15" stroke="#BCD5EA" strokeWidth="1.5" fill="none" />

                {/* MOVABLE PUPIL (Follows cursor smoothly!) */}
                <g transform={`translate(${pupilPos.x}, ${pupilPos.y})`}>
                  <ellipse cx="182" cy="132" rx="8" ry="9.5" fill="url(#cellPupilGrad)" />
                  {/* Catchlights */}
                  <circle cx="179.5" cy="129" r="2.8" fill="#FFFFFF" />
                  <circle cx="184" cy="135" r="1.3" fill="#FFFFFF" opacity="0.85" />
                </g>
              </g>
            </g>
          )}

          {/* Tiny Friendly Mouth */}
          <path
            d={isClicked ? "M155 148 Q160 156 165 148" : "M156 146 Q160 150 164 146"}
            stroke="#152B42"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill={isClicked ? "#E11D48" : "none"}
          />

          {/* Soft Pink Cheeks */}
          <ellipse cx="118" cy="142" rx="8" ry="5" fill="#FDA4AF" opacity="0.5" />
          <ellipse cx="202" cy="142" rx="8" ry="5" fill="#FDA4AF" opacity="0.5" />
        </g>

        {/* Ambient Sparkles */}
        <motion.g
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.2, repeat: Infinity }}
        >
          <path d="M72 78 Q76 78 76 74 Q76 78 80 78 Q76 78 76 82 Q76 78 72 78 Z" fill="#FFFFFF" opacity="0.9" />
          <path d="M258 68 Q261 68 261 65 Q261 68 264 68 Q261 68 261 71 Q261 68 258 68 Z" fill="#E2F1FD" opacity="0.8" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default DermoraCellMascot;
