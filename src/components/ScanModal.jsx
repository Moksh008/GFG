import React, { useState } from 'react';
import { Camera, Upload, AlertCircle, X, Check, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

export default function ScanModal({ isOpen, onClose, onSaveScan }) {
  const [step, setStep] = useState(1);
  const [bodyArea, setBodyArea] = useState('Right Forearm (Epithelial)');
  const [notes, setNotes] = useState('Marginal redness noticeably improved after 3 days of ointment.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(2);
    }, 1500);
  };

  const handleFinalSave = () => {
    const newScan = {
      id: `scan-${Date.now()}`,
      date: 'Today, Nov 27',
      relativeTime: 'Just now',
      bodyArea,
      imageUrl: previewImage,
      aiResult: 'Resolving Erythema / Keratotic Clearance',
      severityScore: 19,
      status: 'Significant Improvement',
      rednessIndex: 22,
      areaCm2: 1.4,
      borderRegularity: '96% Regular',
      symmetry: 'Symmetric',
      notes
    };
    onSaveScan(newScan);
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/70 rounded-[28px] max-w-xl w-full p-6 shadow-2xl relative text-[#1F2A2E]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#0F3B3F] text-white flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#1F2A2E]">New Dermoscopy Scan</h3>
            <p className="text-xs text-[#8A9AA0]">End-to-end encrypted biometric capture</p>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4 mt-4">
            <div className="relative border-2 border-dashed border-[#A9C1CC] rounded-2xl p-4 bg-[#DCEBE8]/20 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-[#DCEBE8]/40 transition">
              <img
                src={previewImage}
                alt="Lesion capture preview"
                className="w-full h-48 object-cover rounded-xl shadow-inner mb-3"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-medium text-[#1F2A2E] shadow-sm border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50"
                  onClick={() => setPreviewImage('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80')}
                >
                  <Upload className="w-3.5 h-3.5" /> Sample B
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-medium text-[#1F2A2E] shadow-sm border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50"
                  onClick={() => setPreviewImage('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80')}
                >
                  <Camera className="w-3.5 h-3.5" /> Sample A
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#1F2A2E] mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#3F5F4A]" /> Anatomical Location
                </label>
                <input
                  type="text"
                  value={bodyArea}
                  onChange={(e) => setBodyArea(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3F5F4A] bg-white"
                  placeholder="e.g. Left Forearm, Upper Back"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#1F2A2E] mb-1 block">Patient Notes / Symptoms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3F5F4A] bg-white resize-none"
                  placeholder="Note any itching, tingling, or changes..."
                />
              </div>
            </div>

            <div className="bg-[#FAFBFB] p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#3F5F4A] mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed text-[#8A9AA0]">
                <strong>Clinical Safeguard:</strong> Observations are computed using convolutional lesion edge profiling. Results are prospective clinical observations, not a replacement for biopsy.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="px-5 py-2 text-xs font-medium text-white bg-[#0F3B3F] hover:bg-[#1F6A66] rounded-xl flex items-center gap-2 shadow-sm transition"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing Morphology...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#F2C98A]" /> Run AI Derm-Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4 animate-in fade-in duration-300">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Observation Verified</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Severity Score: 19 / 100 (-21%)
                </span>
              </div>
              <p className="text-sm font-semibold">Resolving Contact Dermatitis</p>
              <p className="text-xs text-emerald-800/80 mt-1">
                Clear marginal regression detected. Inflammation perimeter contracted by 0.4 cm² compared to scan 15 days ago.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">Redness Index</div>
                <div className="text-base font-bold text-[#1F2A2E] mt-0.5">22% <span className="text-emerald-600 text-xs">↓ 6%</span></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">Surface Area</div>
                <div className="text-base font-bold text-[#1F2A2E] mt-0.5">1.4 cm² <span className="text-emerald-600 text-xs">↓ 0.4</span></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-[#8A9AA0] uppercase font-medium">Symmetry</div>
                <div className="text-base font-bold text-[#1F2A2E] mt-0.5">96%</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSave}
                className="px-5 py-2 text-xs font-medium text-white bg-[#3F5F4A] hover:bg-[#2FBF71] rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Check className="w-3.5 h-3.5" /> Save to Clinical History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
