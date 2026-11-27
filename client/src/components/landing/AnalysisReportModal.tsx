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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#193653]/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 my-8 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#193653] text-teal-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#193653]">Dermora clinical synthesis</h3>
                  <p className="text-[11px] font-mono text-slate-500">Scan ID: DM-8824 • Pipeline v0.4.2</p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* Patient & Scan Metadata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="block text-[10px] font-mono uppercase text-slate-500">Target zone</span>
                  <span className="text-xs font-medium text-[#193653]">Left cheek</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="block text-[10px] font-mono uppercase text-slate-500">Symmetry</span>
                  <span className="text-xs font-medium text-emerald-800">Regular (94%)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="block text-[10px] font-mono uppercase text-slate-500">Classification</span>
                  <span className="text-xs font-medium text-amber-800">Mild / Benign</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="block text-[10px] font-mono uppercase text-slate-500">Circadian lead</span>
                  <span className="text-xs font-medium text-[#193653]">Sleep (4.5h)</span>
                </div>
              </div>

              {/* Visual Lesion Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-28 rounded-lg bg-white shadow-2xs flex items-center justify-center border border-slate-200 overflow-hidden flex-shrink-0">
                  <div className="scale-65">
                    <SkinCreature variant="medium" agitated={false} />
                  </div>
                  <div className="absolute top-1.5 left-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Macro
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 text-left w-full">
                  <h4 className="text-xs font-medium text-[#193653]">Biomarker observations</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Minor localized erythema with follicular keratinization. Perimeter shows smooth boundaries without active ulceration or atypical hyperpigmentation.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Keratin index: 18%</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Vascular density: Stable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifestyle Correlation Graph preview */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-medium uppercase text-slate-600">
                    30-day symptom & lifestyle trajectory
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Logged via Solace</span>
                </div>

                {/* Mini SVG graph */}
                <div className="w-full h-20 relative">
                  <svg viewBox="0 0 400 80" className="w-full h-full overflow-visible">
                    <path
                      d="M0 60 Q80 20, 160 55 T300 30 T400 45"
                      stroke="#193653"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M0 70 Q90 65, 180 35 T280 60 T400 65"
                      stroke="#0D9488"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <circle cx="160" cy="55" r="3" fill="#193653" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="300" cy="30" r="3" fill="#193653" stroke="#FFFFFF" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                  <span>Day 1</span>
                  <span>Day 15 (Stress spike)</span>
                  <span>Day 30 (Present)</span>
                </div>
              </div>

              {/* Tele-Dermatologist Next Steps */}
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 text-left flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-teal-900">Physician export available</div>
                  <div className="text-xs text-teal-800/80 mt-0.5 leading-relaxed">
                    Formatted into standard clinical records, ready to forward directly to Dr. Henderson.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  alert('Report shared securely with your verified dermatologist portal.');
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#193653] hover:bg-[#234A70] rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Forward to clinician</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
