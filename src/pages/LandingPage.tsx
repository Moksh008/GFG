import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from '../components/Navbar';
import { ScrollExperience } from '../components/scenes/ScrollExperience';
import { MindAndSkinSection } from '../components/sections/MindAndSkinSection';
import { MeetSolaceSection } from '../components/sections/MeetSolaceSection';
import { FinalCtaSection } from '../components/sections/FinalCtaSection';
import { Play, Sparkles, CheckCircle2, X } from 'lucide-react';
import { MascotHero } from '../components/characters/MascotHero';

export function LandingPage() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Handle /hero route on initial load and browser navigation
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/hero' || hash === '#hero' || hash === '#scene-hero') {
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
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#5EEAD4', '#DAD9F5', '#8873B9'],
    });
    setOnboardingOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F4] text-[#193653] selection:bg-[#B8D0E4] selection:text-[#193653] overflow-x-hidden">
      {/* 1. Global Navigation Bar */}
      <Navbar
        onGetStartedClick={triggerJourneyStart}
        onLoginClick={() => alert('Dermora Clinical Login Portal (Demo)')}
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
            className="fixed inset-0 bg-[#193653]/60 backdrop-blur-md"
            onClick={() => setVideoModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-white z-10 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <h3 className="text-base font-extrabold text-[#193653]">The Dermora Story</h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-6 rounded-2xl bg-gradient-to-br from-[#DCEAF5] via-[#FAF8F4] to-[#F0E5D8] p-8 text-center flex flex-col items-center justify-center min-h-[260px] border border-white">
              <MascotHero size={160} interactive={false} />
              <p className="mt-4 text-sm font-bold text-[#193653]">
                "Every subtle change on your skin tells a story before it becomes a flare."
              </p>
              <p className="text-xs text-[#193653]/70 max-w-md mt-1">
                Dermora was created by dermatologists and creative technologists to replace frantic web searches with gentle, objective tracking and direct doctor collaboration.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  triggerJourneyStart();
                }}
                className="px-6 py-2.5 rounded-full bg-[#193653] text-white text-xs font-bold hover:bg-[#234A70] transition-colors cursor-pointer"
              >
                Begin Your Scan Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- START YOUR JOURNEY ONBOARDING MODAL --- */}
      {onboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#193653]/60 backdrop-blur-md"
            onClick={() => setOnboardingOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white z-10 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <h3 className="text-base font-extrabold text-[#193653]">Welcome to Dermora</h3>
              </div>
              <button
                onClick={() => setOnboardingOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 space-y-4">
              <p className="text-xs text-[#193653]/75 leading-relaxed">
                Experience the interactive landing page demo:
              </p>
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-[#193653]">1. Scroll through the 5 Scenes</span>
                    <p className="text-slate-500 text-[11px]">Experience the continuous pinned story where creatures multiply, impact indicators emerge, and the vertical timeline updates.</p>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-[#193653]">2. Test Scene 4: "Scan & Analyse"</span>
                    <p className="text-slate-500 text-[11px]">Click the interactive camera shutter or floating badge to trigger the live scanning beam and report modal.</p>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-[#193653]">3. Chat with Solace</span>
                    <p className="text-slate-500 text-[11px]">Ask questions about sleep, stress, and prepare a personalized clinical report.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setOnboardingOpen(false);
                // Scroll into Scene 4 inside the pinned experience
                const st = document.getElementById('hero');
                if (st) {
                  window.scrollTo({ top: 2600, behavior: 'smooth' });
                }
              }}
              className="w-full py-3 rounded-full bg-[#193653] text-white text-xs font-bold hover:bg-[#234A70] transition-colors shadow-md cursor-pointer"
            >
              Jump to AI Scanner Demo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
