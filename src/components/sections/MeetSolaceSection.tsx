import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, Heart, MessageSquare, ArrowRight, Check } from 'lucide-react';
import { MascotPeaceful } from '../characters/MascotPeaceful';
import { MascotHero } from '../characters/MascotHero';

interface Message {
  id: string;
  sender: 'user' | 'solace';
  text: string;
  time: string;
}

export const MeetSolaceSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: 'I noticed a mild reddish patch on my cheek after an exhausting work week. Could this be stress?',
      time: '10:14 AM',
    },
    {
      id: '2',
      sender: 'solace',
      text: 'I hear you. When sustained stress spikes, cortisol can temporarily weaken the skin lipid barrier, making capillaries more reactive. Let\'s track it together for 48 hours and check your sleep duration.',
      time: '10:14 AM',
    },
    {
      id: '3',
      sender: 'user',
      text: 'Should I see Dr. Henderson or wait a couple of days?',
      time: '10:15 AM',
    },
    {
      id: '4',
      sender: 'solace',
      text: 'Your Dermora scan categorized this as mild erythema with regular margins. I\'ve packaged your 7-day diary into a one-page summary that you can send directly to Dr. Henderson with a single tap!',
      time: '10:15 AM',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'How does sleep debt affect eczema?',
    'What should I ask my dermatologist?',
    'Log an evening flare-up with photo',
  ];

  const handleSendPrompt = (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'I’ve correlated that with your recent lifestyle markers. Your skin barrier is resilient, but gentle hydration and resting can support normal recovery.';
      if (prompt.toLowerCase().includes('sleep')) {
        reply = 'Sleep cycles stimulate growth hormones and cellular repair in the basal stratum. Consistently logging 7+ hours supports skin homeostasis.';
      } else if (prompt.toLowerCase().includes('dermatologist')) {
        reply = 'You can ask about topical ceramide formulations, patch tests for contact allergies, and whether recent schedule changes correlate with your observations.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'solace',
          text: reply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <section id="meet-solace" className="relative py-28 px-6 lg:px-12 bg-gradient-to-b from-[#FAF8F4] via-[#F4F9FD] to-[#DCEAF5]/50 overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] rounded-full bg-teal-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#DAD9F5]/40 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-white shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-widest text-[#193653] uppercase">
              Meet Solace
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#193653] tracking-tight leading-tight mb-5">
            Your daily skin companion that{' '}
            <span className="italic font-serif text-[#3B82F6] font-normal underline decoration-[#5EEAD4]/60 decoration-wavy">
              listens and guides.
            </span>
          </h2>

          <p className="text-base text-[#193653]/75 leading-relaxed font-normal">
            Solace synthesizes your daily visual skin scans, mood reflections, and sleep rhythms into calm, evidence-informed dialogue that bridges everyday curiosity with clinical reassurance.
          </p>
        </div>

        {/* Mascot & Chat Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Mascot in Peaceful & Attentive Listening Pose (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative">
              {/* Soft Pulsing Halo behind Solace */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#99F6E4]/40 to-[#BAE6FD]/40 blur-2xl animate-pulse" />

              {/* Solace Character */}
              <div className="relative z-10">
                <MascotPeaceful size={280} />
              </div>

              {/* Status Pill Badge */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/90 border border-white shadow-md text-xs font-bold text-[#193653]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                <span>Solace is listening & ready</span>
              </motion.div>
            </div>

            {/* Micro feature cards */}
            <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
              <div className="p-3 rounded-2xl bg-white/70 border border-white text-left">
                <Heart className="w-4 h-4 text-rose-500 mb-1" />
                <div className="text-xs font-bold text-[#193653]">Empathetic Tone</div>
                <div className="text-[10px] text-[#193653]/60">Never alarmist or medicalized</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/70 border border-white text-left">
                <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
                <div className="text-xs font-bold text-[#193653]">Doctor-Aligned</div>
                <div className="text-[10px] text-[#193653]/60">Prepares structured reports</div>
              </div>
            </div>
          </div>

          {/* Right: Conversational Interface (7 cols) */}
          <div className="lg:col-span-7">
            <div className="clay-card rounded-3xl p-5 sm:p-6 shadow-2xl border border-white max-w-xl mx-auto flex flex-col h-[520px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-[#193653] flex items-center space-x-1.5">
                      <span>Solace Wellness Guide</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                        AI Companion
                      </span>
                    </div>
                    <div className="text-[10px] text-[#193653]/60">Continuous contextual skin memory</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-slate-500 font-semibold">Active</span>
                </div>
              </div>

              {/* Message History Container */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed text-left ${
                          isUser
                            ? 'bg-[#193653] text-white rounded-br-sm shadow-md'
                            : 'bg-white text-[#193653] rounded-bl-sm border border-slate-100 shadow-sm'
                        }`}
                      >
                        <p className="font-normal">{msg.text}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right font-medium ${
                            isUser ? 'text-white/60' : 'text-slate-400'
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sample Prompt Pills */}
              <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-100 flex-shrink-0">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(p)}
                    className="text-[10px] font-semibold text-[#193653]/80 bg-white/80 hover:bg-white border border-white px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    + {p}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="pt-2 flex items-center space-x-2 flex-shrink-0">
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                  placeholder="Ask Solace about skin habits, sleep, or symptoms..."
                  className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs text-[#193653] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B8D0E4]"
                />
                <button
                  onClick={() => handleSendPrompt()}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-full bg-[#193653] hover:bg-[#234A70] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md cursor-pointer flex-shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
