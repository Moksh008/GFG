import React, { useState } from 'react';
import { 
  Scan, 
  Activity, 
  ShieldCheck, 
  TrendingDown, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Maximize2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface HeroTelemetryConsoleProps {
  onStartScan?: () => void;
  className?: string;
}

type ViewMode = 'polarized' | 'erythema' | 'barrier';

export const HeroTelemetryConsole: React.FC<HeroTelemetryConsoleProps> = ({
  onStartScan,
  className = '',
}) => {
  const [day, setDay] = useState<1 | 14>(14);
  const [viewMode, setViewMode] = useState<ViewMode>('polarized');
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1200);
  };

  // Metrics dynamic by Day
  const data = day === 14 ? {
    erythema: '11.8%',
    erythemaChange: '-58.7%',
    erythemaStatus: 'Subsided',
    erythemaColor: 'text-teal-700 bg-teal-50 border-teal-200',
    barrierScore: '92/100',
    barrierLabel: 'Restored lipid matrix',
    barrierPercent: 92,
    stressLevel: 'Low (18%)',
    sleepAvg: '7.8 hrs/night',
    patchColor: '#E6BCAB',
    inflamColor: 'rgba(217, 70, 70, 0.18)',
    inflamSize: 'w-24 h-20',
    borderClass: 'border-teal-500/30',
  } : {
    erythema: '28.6%',
    erythemaChange: '+42.1%',
    erythemaStatus: 'Acute flare',
    erythemaColor: 'text-rose-700 bg-rose-50 border-rose-200',
    barrierScore: '54/100',
    barrierLabel: 'Compromised barrier',
    barrierPercent: 54,
    stressLevel: 'High (68%)',
    sleepAvg: '5.1 hrs/night',
    patchColor: '#E2B2A0',
    inflamColor: 'rgba(225, 29, 72, 0.48)',
    inflamSize: 'w-36 h-32',
    borderClass: 'border-rose-500/40',
  };

  return (
    <div className={`w-full max-w-[520px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left transition-all duration-300 ${className}`}>
      {/* Top Clinical Header Bar */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-xs font-semibold text-[#193653] tracking-tight">
            Clinical Surface Telemetry
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-600 font-medium">
            DinoV2-Skin v0.9
          </span>
        </div>

        {/* Day 1 vs Day 14 Toggle */}
        <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/50 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setDay(1)}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              day === 1 
                ? 'bg-white text-[#193653] shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Day 1 (Flare)
          </button>
          <button
            type="button"
            onClick={() => setDay(14)}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              day === 14 
                ? 'bg-teal-700 text-white shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Day 14 (Progress)
          </button>
        </div>
      </div>

      {/* Main Telemetry Viewport (Interactive Skin Patch) */}
      <div className="relative h-[210px] w-full bg-radial from-slate-100 via-slate-50 to-slate-200/60 flex items-center justify-center overflow-hidden border-b border-slate-200/80">
        {/* Reticle Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Corner Reticles */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 select-none">
          + LAT: 24.8°N | ISO: 100
        </div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 select-none flex items-center space-x-1">
          <Maximize2 className="w-3 h-3 text-slate-400" />
          <span>MAG 10×</span>
        </div>

        {/* Microscopic Skin Surface Simulation */}
        <div 
          className="relative w-48 h-40 rounded-3xl transition-all duration-700 flex items-center justify-center shadow-inner overflow-hidden"
          style={{
            backgroundColor: data.patchColor,
            backgroundImage: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
          }}
        >
          {/* Micro vascular texture overlay */}
          <div 
            className="absolute inset-0 opacity-25 mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(#9b4222 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
            }}
          />

          {/* Inflammatory / Flare zone */}
          <div 
            className={`rounded-full blur-md transition-all duration-700 ${data.inflamSize}`}
            style={{
              backgroundColor: viewMode === 'erythema' 
                ? (day === 1 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(20, 184, 166, 0.45)')
                : data.inflamColor,
            }}
          />

          {/* Optical Polarization filter effect */}
          {viewMode === 'barrier' && (
            <div className="absolute inset-0 bg-teal-500/10 mix-blend-color-dodge flex items-center justify-center">
              <div className="w-32 h-24 border border-dashed border-teal-600/40 rounded-xl" />
            </div>
          )}

          {/* Calibrated Measurement Perimeter Box */}
          <div className={`absolute inset-4 rounded-2xl border-2 border-dashed ${data.borderClass} pointer-events-none flex flex-col justify-between p-2`}>
            <div className="flex justify-between items-start text-[9px] font-mono font-bold text-slate-700/80">
              <span className="bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
                ROI #1: {day === 1 ? '3.8 cm²' : '1.4 cm²'}
              </span>
              <span className="bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
                Δ 99.4% conf
              </span>
            </div>
            
            <div className="text-[9px] font-mono text-slate-700/80 bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded self-start">
              Scale: 8.0 mm
            </div>
          </div>

          {/* Active scanning bar during simulation */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-teal-400 shadow-[0_0_12px_#2dd4bf] animate-[scan_1.2s_ease-in-out_infinite]" />
          )}
        </div>

        {/* View Mode Pills (Bottom overlay) */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('polarized')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                viewMode === 'polarized' ? 'bg-[#193653] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cross-Polarized
            </button>
            <button
              type="button"
              onClick={() => setViewMode('erythema')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                viewMode === 'erythema' ? 'bg-[#193653] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Erythema Heatmap
            </button>
            <button
              type="button"
              onClick={() => setViewMode('barrier')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                viewMode === 'barrier' ? 'bg-[#193653] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barrier Mesh
            </button>
          </div>

          {/* Interactive Re-scan trigger button */}
          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="px-2.5 py-1 rounded-lg bg-white/95 hover:bg-slate-100 text-[#193653] text-[10px] font-semibold border border-slate-200 shadow-2xs flex items-center space-x-1 transition-all cursor-pointer"
          >
            <Scan className={`w-3 h-3 text-teal-700 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Analyzing...' : 'Calibrate'}</span>
          </button>
        </div>
      </div>

      {/* Metrics & Clinical Delta Dashboard */}
      <div className="p-4 bg-white space-y-3">
        {/* Metric Row 1: Erythema vs Barrier Integrity */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Erythema Index */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Erythema Index</span>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-semibold text-[#193653] tracking-tight">
                {data.erythema}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${data.erythemaColor}`}>
                {data.erythemaChange}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Surface vascular dilation
            </p>
          </div>

          {/* Card 2: Stratum Corneum Barrier */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Lipid Barrier</span>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-semibold text-[#193653] tracking-tight">
                {data.barrierScore}
              </span>
              <span className="text-[10px] text-teal-700 font-medium">
                {day === 14 ? '↑ 38 pts' : 'Baseline'}
              </span>
            </div>
            <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  day === 14 ? 'bg-teal-600' : 'bg-amber-500'
                }`}
                style={{ width: `${data.barrierPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Circadian Stress & Sleep Correlation Strip */}
        <div className="px-3 py-2.5 rounded-xl bg-teal-50/60 border border-teal-100/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-100/80 flex items-center justify-center text-teal-800">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-teal-950">
                Circadian & Sleep Correlation
              </div>
              <div className="text-[10px] text-teal-700/90 font-medium">
                Stress: {data.stressLevel} • Rest: {data.sleepAvg}
              </div>
            </div>
          </div>

          {onStartScan && (
            <button
              type="button"
              onClick={onStartScan}
              className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 flex items-center space-x-0.5 transition-colors cursor-pointer"
            >
              <span>Test yours</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroTelemetryConsole;
