import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scan, ShieldCheck, Cpu } from 'lucide-react';
import { PhoneScanner } from '../characters/PhoneScanner';
import { SkinSurface } from '../characters/SkinSurface';
import { WaterDroplet, MolecularStructure } from '../characters/FloatingElements';

interface Scene4ScanAnalyseProps {
  onScanComplete?: () => void;
  progress?: number;
}

export const Scene4ScanAnalyse: React.FC<Scene4ScanAnalyseProps> = ({
  onScanComplete,
  progress = 0,
}) => {
  return (
    <div
      id="scene-scan"
      className="relative min-h-screen w-full flex flex-col justify-between pt-20 pb-12 overflow-hidden bg-gradient-to-b from-[#FAF1E8] via-[#F0F6FA] to-[#EAF2F8]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full bg-[#B8D0E4]/30 blur-2xl pointer-events-none" />

      <div className="absolute top-24 left-16 hidden lg:block">
        <MolecularStructure />
      </div>
      <div className="absolute top-1/3 right-14 hidden md:block">
        <WaterDroplet size={40} delay={0.8} />
      </div>

      {/* Main Grid Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-20 flex-1 my-auto">
        {/* Left Column: Headlines & Clinical AI explanation */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-start text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              The Solution
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-[1.2] mb-4">
            Catch it early with{' '}
            <span className="text-teal-600">Dermora.</span>
          </h2>

          <p className="text-base text-[#193653]/75 leading-relaxed max-w-md font-normal mb-6">
            Capture, analyse and understand your skin with AI before concerns become harder to manage. Multi-spectral image segmentation isolates subtle structural shifts in seconds.
          </p>

          {/* Interactive Feature Pills */}
          <div className="flex flex-col space-y-2.5 w-full max-w-sm">
            <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/70 border border-white shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-inner">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#193653]">Macro-Dermal Segmentation</div>
                <div className="text-[10px] text-[#193653]/60">Detects lesion perimeter asymmetry</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/70 border border-white shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#193653]">Privacy-First Edge Encryption</div>
                <div className="text-[10px] text-[#193653]/60">HIPAA compliant zero-knowledge pipeline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Interactive Tilted Smartphone with Scan Viewport */}
        <div className="lg:col-span-7 xl:col-span-8 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px]">
          <PhoneScanner onScanComplete={onScanComplete} />
        </div>
      </div>

      {/* Undulating Skin Surface across lower half */}
      <div className="relative w-full z-10 -mt-16">
        <SkinSurface variant="valley" />
      </div>
    </div>
  );
};
