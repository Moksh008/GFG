import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Heart, Sparkles, Droplets, Mail } from 'lucide-react';
import { MascotHero } from '../characters/MascotHero';
import { SkinSurface } from '../characters/SkinSurface';
import { WaterDroplet, MolecularStructure } from '../characters/FloatingElements';

interface FinalCtaSectionProps {
  onGetStarted?: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onGetStarted,
}) => {
  return (
    <footer className="relative pt-24 pb-12 bg-gradient-to-b from-[#DCEAF5]/50 via-[#F0E5D8]/40 to-[#FAF8F4] overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#DAD9F5]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-12 left-1/4 hidden md:block">
        <WaterDroplet size={36} delay={0.3} />
      </div>
      <div className="absolute top-16 right-1/4 hidden md:block">
        <WaterDroplet size={42} delay={1.1} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10">
        {/* --- MAIN HERO CTA CARD --- */}
        <div className="clay-card rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xl border border-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-200/30 blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-200/30 blur-2xl" />

          {/* Mascot in Center */}
          <div className="flex justify-center -mt-6 mb-4">
            <MascotHero size={220} interactive={false} />
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-white shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              Begin Today
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-tight max-w-2xl mx-auto mb-5">
            Your skin journey deserves a{' '}
            <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#93C5FD]/60 decoration-wavy">
              more thoughtful approach.
            </span>
          </h2>

          <p className="text-base text-[#193653]/75 leading-relaxed max-w-lg mx-auto mb-8 font-normal">
            Take control of subtle changes before they flare up. Join thousands navigating skin health with gentle clarity, daily AI support, and direct clinician synergy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 rounded-full bg-[#193653] hover:bg-[#234A70] text-white text-sm font-bold shadow-xl glow-navy flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Get Started with Dermora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="/hero"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/hero');
                document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-4 rounded-full bg-white/80 hover:bg-white text-[#193653] text-sm font-semibold border border-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Replay Visual Journey ↑
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 text-xs text-[#193653]/70 font-semibold">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>HIPAA-Compliant Encryption</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Board-Certified Derm Network</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Zero High-Pressure Upselling</span>
            </div>
          </div>
        </div>

        {/* --- COMPREHENSIVE FOOTER NAVIGATION --- */}
        <div className="mt-20 pt-12 border-t border-[#193653]/10 grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#193653]">Dermora</span>
            </div>
            <p className="text-xs text-[#193653]/65 leading-relaxed max-w-sm mb-4">
              Pioneering character-led visual skin wellness. Combining computer vision, circadian tracking, and tele-dermatology into an empathetic daily experience.
            </p>
            <div className="text-[11px] text-[#193653]/50">
              © 2026 Dermora Health Inc. All rights reserved.
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#193653] mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-[#193653]/70">
              <li><a href="/hero" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/hero'); document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#193653] transition-colors">Visual Story</a></li>
              <li><a href="#scene-scan" className="hover:text-[#193653] transition-colors">AI Skin Scan</a></li>
              <li><a href="#scene-doctor" className="hover:text-[#193653] transition-colors">Doctor Review</a></li>
              <li><a href="#meet-solace" className="hover:text-[#193653] transition-colors">Solace Companion</a></li>
            </ul>
          </div>

          {/* Col 3: Science */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#193653] mb-3">Science</h4>
            <ul className="space-y-2 text-xs text-[#193653]/70">
              <li><a href="#mind-skin" className="hover:text-[#193653] transition-colors">Neuro-Cutaneous Link</a></li>
              <li><a href="#mind-skin" className="hover:text-[#193653] transition-colors">Circadian Dermatology</a></li>
              <li><a href="#" className="hover:text-[#193653] transition-colors">Clinical Validation</a></li>
              <li><a href="#" className="hover:text-[#193653] transition-colors">HIPAA Whitepaper</a></li>
            </ul>
          </div>

          {/* Col 4: Legal & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#193653] mb-3">Legal & Trust</h4>
            <ul className="space-y-2 text-xs text-[#193653]/70">
              <li><a href="#" className="hover:text-[#193653] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#193653] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#193653] transition-colors">Medical Disclaimer</a></li>
              <li><a href="#" className="hover:text-[#193653] transition-colors">Security Center</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Medical Disclaimer Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200/50 text-[11px] text-[#193653]/50 text-center max-w-3xl mx-auto leading-relaxed">
          Disclaimer: Dermora provides observational symptom tracking and educational wellness insights powered by algorithmic image analysis. Dermora does not provide formal medical diagnoses. Always consult a licensed dermatologist or physician for clinical advice, diagnosis, or treatment.
        </div>
      </div>
    </footer>
  );
};
