import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Share2, FileText } from 'lucide-react';
import { SkinCreature } from './characters/SkinCreature';

interface AnalysisReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisReportModal: React.FC<AnalysisReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#193653]/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#DCEAF5]/60 via-white to-[#F0E5D8]/50 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#193653] text-teal-300 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#193653]">Dermora Clinical Synthesis</h3>
                  <p className="text-xs text-[#193653]/60">Scan ID: #DM-8824 • AI Version 4.2.1</p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Patient & Scan Metadata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Target Area</span>
                  <span className="text-xs font-bold text-[#193653]">Left Cheek (Malar)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Lesion Symmetry</span>
                  <span className="text-xs font-bold text-emerald-600">Regular (94%)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Risk Assessment</span>
                  <span className="text-xs font-bold text-amber-600">Mild / Benign</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Correlated Trigger</span>
                  <span className="text-xs font-bold text-purple-600">Sleep deficit (4.5h)</span>
                </div>
              </div>

              {/* Visual Lesion Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF8F4] to-[#F1F6FA] border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-36 h-36 rounded-2xl bg-white shadow-inner flex items-center justify-center border border-slate-200 overflow-hidden flex-shrink-0">
                  <div className="scale-75">
                    <SkinCreature variant="medium" agitated={false} />
                  </div>
                  <div className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    Macro Biometric
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 text-left w-full">
                  <h4 className="text-sm font-bold text-[#193653]">Biomarker Observations</h4>
                  <p className="text-xs text-[#193653]/70 leading-relaxed">
                    Minor localized erythema with follicular keratinization. Perimeter shows smooth boundaries without active ulceration or atypical hyperpigmentation.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                      <span>Keratin Index: 18%</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                      <span>Vascular Density: Stable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifestyle Correlation Graph preview */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#193653]">
                    30-Day Symptom & Lifestyle Trajectory
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">Logged Daily via Solace</span>
                </div>

                {/* Mini SVG graph */}
                <div className="w-full h-24 relative">
                  <svg viewBox="0 0 400 80" className="w-full h-full overflow-visible">
                    <path
                      d="M0 60 Q80 20, 160 55 T300 30 T400 45"
                      stroke="#8873B9"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d="M0 70 Q90 65, 180 35 T280 60 T400 65"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    {/* Data Points */}
                    <circle cx="160" cy="55" r="4" fill="#8873B9" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="300" cy="30" r="4" fill="#8873B9" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Day 1</span>
                  <span>Day 15 (Stress spike)</span>
                  <span>Day 30 (Present)</span>
                </div>
              </div>

              {/* Tele-Dermatologist Next Steps */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-left flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-teal-900">Physician Recommendation Available</div>
                  <div className="text-xs text-teal-700/80 mt-0.5 leading-relaxed">
                    This report has been formatted into DICOM / HL7 clinical standards and can be automatically forwarded to Dr. Henderson or your preferred clinician.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  alert('Report shared securely with your verified dermatologist portal.');
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#193653] hover:bg-[#234A70] rounded-full shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Forward to Doctor</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
