import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { SkinCreature } from './SkinCreature';

interface PhoneScannerProps {
  onScanComplete?: () => void;
  className?: string;
}

export const PhoneScanner: React.FC<PhoneScannerProps> = ({
  onScanComplete,
  className = '',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('Ready to scan');
  const [scanFinished, setScanFinished] = useState(false);

  const startScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanFinished(false);
    setScanProgress(0);
    setScanStatus('Aligning dermal focus...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setScanProgress(progress);

      if (progress === 28) {
        setScanStatus('Segmenting follicle boundaries...');
      } else if (progress === 60) {
        setScanStatus('Matching clinical morphology DB...');
      } else if (progress === 88) {
        setScanStatus('Synthesizing risk insights...');
      } else if (progress >= 100) {
        clearInterval(interval);
        setScanStatus('Analysis Complete!');
        setIsScanning(false);
        setScanFinished(true);
        if (onScanComplete) {
          setTimeout(() => onScanComplete(), 600);
        }
      }
    }, 90);
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Hand & Phone Wrapper tilted 10 degrees */}
      <motion.div
        className="relative"
        animate={{
          rotate: [9, 11, 9],
          y: [0, -6, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Soft 3D Shadow under Phone */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-80 h-16 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(25, 54, 83, 0.45) 0%, rgba(184, 208, 228, 0) 70%)',
          }}
        />

        {/* 3D Illustrated Clay Hands holding phone */}
        <svg
          className="absolute -bottom-10 -left-12 w-[460px] h-48 pointer-events-none z-20 overflow-visible"
          viewBox="0 0 460 200"
          fill="none"
        >
          <defs>
            <radialGradient id="handSkinGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF4ED" />
              <stop offset="50%" stopColor="#FCD5C2" />
              <stop offset="90%" stopColor="#E6AE96" />
              <stop offset="100%" stopColor="#C98B71" />
            </radialGradient>
            <radialGradient id="thumbSkinGrad" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFF8F4" />
              <stop offset="60%" stopColor="#FAD3BF" />
              <stop offset="100%" stopColor="#D99B81" />
            </radialGradient>
          </defs>

          {/* Left Hand Fingers gripping left bezel */}
          <path
            d="M60 160 C50 120, 75 75, 110 82 C120 85, 122 105, 112 120 C100 135, 85 155, 75 180 Z"
            fill="url(#handSkinGrad)"
          />
          {/* Left Thumb resting on lower left corner */}
          <ellipse cx="118" cy="115" rx="16" ry="24" transform="rotate(-25 118 115)" fill="url(#thumbSkinGrad)" />

          {/* Right Hand Palm & Arm coming from lower right */}
          <path
            d="M390 190 C360 145, 335 110, 310 95 C295 86, 280 98, 285 118 C295 140, 320 170, 345 200 Z"
            fill="url(#handSkinGrad)"
          />
          {/* Right Index Finger touching screen trigger */}
          <path
            d="M320 105 C305 85, 275 80, 245 92 C235 96, 235 112, 245 118 C265 125, 285 120, 305 130 Z"
            fill="url(#thumbSkinGrad)"
          />
        </svg>

        {/* --- SMARTPHONE CHASSIS --- */}
        <div
          className="relative w-[310px] h-[480px] rounded-[42px] p-3 shadow-2xl z-10"
          style={{
            background: 'linear-gradient(145deg, #2D3A4B 0%, #152232 50%, #0F1722 100%)',
            boxShadow: '0 25px 60px -15px rgba(25, 54, 83, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
          }}
        >
          {/* Metallic Phone Bezel Edge Highlight */}
          <div className="absolute inset-0 rounded-[42px] border border-white/20 pointer-events-none" />

          {/* Phone Screen Display */}
          <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-gradient-to-b from-[#E6F0FA] via-[#F4F9FD] to-[#E9DFD4] flex flex-col justify-between p-4">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#193653]/70 px-2 pt-1 z-30">
              <span>9:41</span>
              {/* Dynamic Island / Notch */}
              <div className="w-20 h-4 bg-[#0F1722] rounded-full mx-auto" />
              <div className="flex items-center space-x-1">
                <span>5G</span>
                <div className="w-4 h-2 rounded-sm border border-[#193653]/60 p-[1px]">
                  <div className="w-full h-full bg-[#193653] rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* App Header inside phone */}
            <div className="flex items-center justify-between px-2 pt-2 z-30">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs font-bold text-[#193653] tracking-wide">DERMORA VISION</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 backdrop-blur font-medium text-[#193653]">
                {scanStatus}
              </span>
            </div>

            {/* --- CAMERA SCANNING VIEWPORT --- */}
            <div className="relative flex-1 my-2 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-white/40 to-[#F0E5D8]/50 border border-white/60">
              {/* Soft skin surface base background in viewport */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at 50% 65%, #FDE4D0 0%, #F5CFB8 50%, #E8BC9E 100%)',
                }}
              />

              {/* Cellular skin texture dots */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#C88E72 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* The Target Creature inside phone scan */}
              <div className="relative z-10 scale-90">
                <SkinCreature
                  variant="medium"
                  agitated={isScanning}
                  glow={isScanning}
                  showExclamation={!isScanning}
                />
              </div>

              {/* --- CAMERA RETICLE / VIEWFINDER CORNERS --- */}
              <div className="absolute inset-4 pointer-events-none z-20">
                {/* Top-left corner */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-500 rounded-tl-lg shadow-sm" />
                {/* Top-right corner */}
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-500 rounded-tr-lg shadow-sm" />
                {/* Bottom-left corner */}
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-500 rounded-bl-lg shadow-sm" />
                {/* Bottom-right corner */}
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-500 rounded-br-lg shadow-sm" />

                {/* Subtle center crosshairs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-teal-400/30 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                </div>
              </div>

              {/* --- GLOWING VERTICAL SCANNING BEAM --- */}
              {isScanning && (
                <motion.div
                  className="absolute inset-x-2 h-10 z-30 pointer-events-none"
                  animate={{
                    top: ['5%', '85%', '5%'],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Laser line */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_15px_#2DD4BF]" />
                  {/* Laser light gradient curtain */}
                  <div className="w-full h-8 bg-gradient-to-b from-teal-400/25 to-transparent" />
                </motion.div>
              )}

              {/* Scanning Particle sparkles */}
              {isScanning && (
                <motion.div
                  className="absolute inset-0 z-30 pointer-events-none"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_#5EEAD4]" />
                  <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67E8F9]" />
                  <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#6EE7B7]" />
                </motion.div>
              )}
            </div>

            {/* Bottom Controls inside Phone */}
            <div className="flex items-center justify-between px-3 py-2 z-30">
              <div className="text-left">
                <span className="block text-[10px] text-[#193653]/60 uppercase tracking-wider font-semibold">Mode</span>
                <span className="text-xs font-bold text-[#193653]">HD Biometric</span>
              </div>

              {/* Big Shutter / Scan Button */}
              <button
                onClick={startScan}
                disabled={isScanning}
                aria-label="Trigger AI skin scan"
                className="relative group p-1 rounded-full focus:outline-none transition-transform active:scale-95 cursor-pointer"
              >
                {/* Outer ring */}
                <div className="w-14 h-14 rounded-full border-2 border-white/80 shadow-md flex items-center justify-center bg-white/40 backdrop-blur">
                  {/* Circular progress bar SVG */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="#E2E8F0"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="#0D9488"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="150"
                      strokeDashoffset={150 - (150 * scanProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Core button */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 shadow-md flex items-center justify-center group-hover:scale-105 transition-all">
                    {isScanning ? (
                      <span className="text-[11px] font-black text-white">{scanProgress}%</span>
                    ) : scanFinished ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Scan className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              </button>

              <div className="text-right">
                <span className="block text-[10px] text-[#193653]/60 uppercase tracking-wider font-semibold">Zoom</span>
                <span className="text-xs font-bold text-[#193653]">3.2x Macro</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- FLOATING "SCAN & ANALYSE" CALLOUT BADGE --- */}
      <motion.div
        className="absolute -right-8 top-1/3 z-30 cursor-pointer select-none"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={startScan}
      >
        <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#193653] to-[#2D537B] flex items-center justify-center text-white shadow-md">
            <Scan className="w-4 h-4 text-teal-300 animate-pulse" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-extrabold text-[#193653] flex items-center space-x-1">
              <span>Scan & Analyse</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <div className="text-[10px] text-[#193653]/65 font-medium">
              {isScanning ? 'Processing scan...' : 'Click to test AI engine'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
