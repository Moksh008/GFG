import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { ScrollExperience } from '../components/landing/scenes/ScrollExperience';
import { MindAndSkinSection } from '../components/landing/sections/MindAndSkinSection';
import { MeetSolaceSection } from '../components/landing/sections/MeetSolaceSection';
import { FinalCtaSection } from '../components/landing/sections/FinalCtaSection';
import { Play, Activity, CheckCircle2, X } from 'lucide-react';
import { MascotHero } from '../components/landing/characters/MascotHero';

export function LandingPage() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const navigate = useNavigate();

  // Handle hero hash route on initial load and browser navigation
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      if (hash === '#hero' || hash === '#scene-hero') {
        const heroElem = document.getElementById('hero');
        if (heroElem) {
          heroElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  const triggerJourneyStart = () => {
    setOnboardingOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F4] text-[#193653] selection:bg-slate-200 selection:text-[#193653] overflow-x-hidden">
      {/* 1. Global Navigation Bar */}
      <Navbar
        onGetStartedClick={triggerJourneyStart}
        onLoginClick={() => navigate('/login')}
      />

      {/* 2. Coordinated Pinned Scroll Storytelling Experience (Scenes 1 to 5) */}
      <main>
        <ScrollExperience
          onStartJourney={triggerJourneyStart}
          onWatchStory={() => setVideoModalOpen(true)}
        />

        {/* 3. Section 6: Mind and Skin */}
        <MindAndSkinSection />

        {/* 4. Section 7: Meet Solace */}
        <MeetSolaceSection />

        {/* 5. Section 8: Final CTA & Footer */}
        <FinalCtaSection onGetStarted={triggerJourneyStart} />
      </main>

      {/* --- WATCH THE STORY MODAL --- */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#193653]/40 backdrop-blur-sm"
            onClick={() => setVideoModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 z-10 text-left">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#193653]">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <h3 className="text-sm font-medium text-[#193653]">Dermora overview</h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="my-5 rounded-xl bg-slate-50 p-6 text-center flex flex-col items-center justify-center min-h-[220px] border border-slate-200">
              <MascotHero size={140} interactive={false} />
              <p className="mt-3 text-sm font-medium text-[#193653]">
                "Every subtle change on your skin tells a story before it becomes a flare."
              </p>
              <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                Dermora pairs daily vision analysis with circadian markers to enable timely clinical collaboration.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#193653] text-xs font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  triggerJourneyStart();
                }}
                className="px-4 py-2 rounded-lg bg-[#193653] text-white text-xs font-medium hover:bg-[#234A70] transition-colors cursor-pointer"
              >
                Start assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- START YOUR JOURNEY ONBOARDING MODAL --- */}
      {onboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#193653]/40 backdrop-blur-sm"
            onClick={() => setOnboardingOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 z-10 text-left">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-medium text-[#193653]">Clinical onboarding</h3>
              </div>
              <button
                onClick={() => setOnboardingOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore the clinical interactive workflow:
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-medium text-[#193653]">1. Scroll progression</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">Observe early barrier shifts, cell propagation, and systemic lifestyle markers.</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-medium text-[#193653]">2. Test vision scanner</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">Trigger calibrated mobile macro capture to segment boundaries and inspect redness.</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-medium text-[#193653]">3. Solace clinical dialogue</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">Synthesize sleep and stress correlations into verified clinical reports.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={() => {
                  setOnboardingOpen(false);
                  const st = document.getElementById('hero');
                  if (st) {
                    window.scrollTo({ top: 2600, behavior: 'smooth' });
                  }
                }}
                className="w-full py-2.5 rounded-lg bg-[#193653] text-white text-xs font-medium hover:bg-[#234A70] transition-colors shadow-xs cursor-pointer"
              >
                Jump to vision scanner demo
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-lg bg-white border border-slate-200 text-[#193653] text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Create account & sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
