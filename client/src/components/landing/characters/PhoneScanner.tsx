import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, CheckCircle2, Focus } from 'lucide-react';
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
        setScanStatus('Analysis complete');
        setIsScanning(false);
        setScanFinished(true);
        if (onScanComplete) {
          setTimeout(() => onScanComplete(), 500);
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
          y: [0, -4, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Soft Neutral Shadow under Phone */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-80 h-16 rounded-full blur-xl opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(25, 54, 83, 0.3) 0%, rgba(25, 54, 83, 0) 70%)',
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
          className="relative w-[310px] h-[480px] rounded-[36px] p-2.5 z-10 bg-[#152232] border border-slate-700/60 shadow-xl"
        >
          {/* Phone Screen Display */}
          <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-slate-50 flex flex-col justify-between p-3.5 border border-slate-200/60">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2 pt-1 z-30">
              <span>09:41</span>
              {/* Dynamic Island / Notch */}
              <div className="w-16 h-3.5 bg-[#152232] rounded-full mx-auto" />
              <div className="flex items-center space-x-1 text-[10px]">
                <span>REC</span>
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              </div>
            </div>

            {/* App Header inside phone */}
            <div className="flex items-center justify-between px-2 pt-2 z-30">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-600" />
                <span className="text-[11px] font-mono font-medium text-[#193653] tracking-tight">DERMORA TELEMETRY</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                {scanStatus}
              </span>
            </div>

            {/* --- CAMERA SCANNING VIEWPORT --- */}
            <div className="relative flex-1 my-2 rounded-xl overflow-hidden flex items-center justify-center bg-slate-100 border border-slate-200">
              {/* Soft skin surface base background in viewport */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at 50% 65%, #FDE4D0 0%, #F5CFB8 50%, #E8BC9E 100%)',
                }}
              />

              {/* Cellular skin texture dots */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
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
                  glow={false}
                  showExclamation={false}
                />
              </div>

              {/* --- CAMERA RETICLE / VIEWFINDER CORNERS (Exact Dermatoscope Look) --- */}
              <div className="absolute inset-4 pointer-events-none z-20">
                {/* Top-left corner */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-600 rounded-tl-sm" />
                {/* Top-right corner */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-600 rounded-tr-sm" />
                {/* Bottom-left corner */}
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-600 rounded-bl-sm" />
                {/* Bottom-right corner */}
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-600 rounded-br-sm" />

                {/* Subtle center optical crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-teal-600/40 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-teal-600 rounded-full" />
                </div>
              </div>

              {/* --- CALIBRATED SCANNING BEAM --- */}
              {isScanning && (
                <motion.div
                  className="absolute inset-x-2 h-0.5 z-30 pointer-events-none bg-teal-500"
                  animate={{
                    top: ['8%', '88%', '8%'],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}
            </div>

            {/* Bottom Controls inside Phone */}
            <div className="flex items-center justify-between px-3 py-1.5 z-30">
              <div className="text-left font-mono">
                <span className="block text-[9px] text-slate-500 uppercase">Mode</span>
                <span className="text-xs font-medium text-[#193653]">Dermatoscope</span>
              </div>

              {/* Big Shutter / Scan Button */}
              <button
                onClick={startScan}
                disabled={isScanning}
                aria-label="Trigger AI skin scan"
                className="relative group p-1 rounded-full focus:outline-none cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center bg-white shadow-sm">
                  {/* Circular progress bar SVG */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#F1F5F9"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#0D9488"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray="125"
                      strokeDashoffset={125 - (125 * scanProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Core button */}
                  <div className="w-8 h-8 rounded-full bg-[#193653] text-white flex items-center justify-center">
                    {isScanning ? (
                      <span className="text-[10px] font-mono font-medium">{scanProgress}%</span>
                    ) : scanFinished ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <Scan className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              <div className="text-right font-mono">
                <span className="block text-[9px] text-slate-500 uppercase">Optics</span>
                <span className="text-xs font-medium text-[#193653]">Macro 3.2x</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- FLOATING "SCAN & ANALYSE" CALLOUT BADGE --- */}
      <div
        className="absolute -right-6 top-1/3 z-30 cursor-pointer select-none"
        onClick={startScan}
      >
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-md">
          <div className="w-8 h-8 rounded-lg bg-[#193653] flex items-center justify-center text-white">
            <Focus className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-medium text-[#193653]">
              Vision analysis demo
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {isScanning ? 'Segmenting barrier...' : 'Click to run analysis'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
