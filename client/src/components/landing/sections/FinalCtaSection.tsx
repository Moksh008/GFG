import React from 'react';
import { ArrowRight, ShieldCheck, Heart, Activity } from 'lucide-react';
import { MascotHero } from '../characters/MascotHero';

interface FinalCtaSectionProps {
  onGetStarted?: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onGetStarted,
}) => {
  return (
    <footer className="relative pt-20 pb-12 bg-[#FAF8F4] border-t border-slate-200/60 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10">
        {/* --- MAIN HERO CTA CARD --- */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Mascot in Center */}
          <div className="flex justify-center -mt-4 mb-3">
            <MascotHero size={180} interactive={false} />
          </div>

          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 shadow-2xs mb-4">
            <span className="text-[10px] font-mono font-medium text-teal-700">[ + ] Preventive care</span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-xs text-slate-600">Start baseline scan</span>
          </div>

          <h2 className="text-2xl sm:text-3xl xl:text-4xl font-medium text-[#193653] tracking-tight leading-tight max-w-xl mx-auto mb-4">
            Thoughtful, evidence-informed skin tracking
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto mb-7 font-normal">
            Take control of subtle barrier changes before symptoms escalate. Pair objective vision scans with circadian context and collaborative clinical triage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-lg bg-[#193653] hover:bg-[#234A70] text-white text-xs sm:text-sm font-medium shadow-sm flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Begin clinical assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-lg bg-white hover:bg-slate-50 text-[#193653] text-xs sm:text-sm font-medium border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Return to progression view
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>HIPAA-aligned data security</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>Board-certified clinical triage</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-teal-700" />
              <span>Objective observation</span>
            </div>
          </div>
        </div>

        {/* --- COMPREHENSIVE FOOTER NAVIGATION --- */}
        <div className="mt-16 pt-10 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-[#193653] flex items-center justify-center text-white">
                <svg viewBox="0 0 24 28" className="w-3 h-3.5" fill="none">
                  <path
                    d="M12 3 C14.5 7.5, 20 13, 20 18 C20 22.4, 16.4 26, 12 26 C7.6 26, 4 22.4, 4 18 C4 13, 9.5 7.5, 12 3 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-semibold text-base tracking-tight text-[#193653]">Dermora</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-3">
              Character-led visual skin wellness. Combining computer vision, circadian tracking, and tele-dermatology into an empathetic clinical experience.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              © 2026 Dermora Health Inc. All rights reserved.
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600 mb-2.5">Platform</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li><a href="/" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/'); document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#193653] transition-colors">Visual story</a></li>
              <li><a href="#scene-scan" className="hover:text-[#193653] transition-colors">Vision scan</a></li>
              <li><a href="#scene-doctor" className="hover:text-[#193653] transition-colors">Doctor review</a></li>
              <li><a href="#meet-solace" className="hover:text-[#193653] transition-colors">Solace assistant</a></li>
            </ul>
          </div>

          {/* Col 3: Science */}
          <div>
            <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600 mb-2.5">Science</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li><a href="#mind-skin" className="hover:text-[#193653] transition-colors">Neuro-cutaneous link</a></li>
              <li><a href="#mind-skin" className="hover:text-[#193653] transition-colors">Circadian dermatology</a></li>
              <li><span className="text-slate-400">Clinical validation</span></li>
              <li><span className="text-slate-400">Security whitepaper</span></li>
            </ul>
          </div>

          {/* Col 4: Legal & Contact */}
          <div>
            <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600 mb-2.5">Compliance</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li><span className="text-slate-400">Privacy policy</span></li>
              <li><span className="text-slate-400">Terms of service</span></li>
              <li><span className="text-slate-400">Medical disclaimer</span></li>
              <li><span className="text-slate-400">Security architecture</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Medical Disclaimer Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200/50 text-[11px] text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
          Disclaimer: Dermora provides observational symptom tracking and educational wellness insights powered by algorithmic image analysis. Dermora does not provide formal medical diagnoses. Always consult a licensed dermatologist or physician for clinical advice, diagnosis, or treatment.
        </div>
      </div>
    </footer>
  );
};
