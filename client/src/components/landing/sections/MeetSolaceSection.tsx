import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Heart, FileCheck } from 'lucide-react';
import { MascotPeaceful } from '../characters/MascotPeaceful';

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
      text: 'When sustained stress spikes, cortisol can temporarily weaken the skin lipid barrier, making capillaries more reactive. Let\'s track it together for 48 hours and check your sleep duration.',
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
      text: 'Your Dermora scan categorized this as mild erythema with regular margins. I\'ve packaged your 7-day diary into a one-page summary that you can send directly to Dr. Henderson.',
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
      let reply = 'I have correlated that with your recent lifestyle markers. Your skin barrier is resilient, but gentle hydration and resting can support normal recovery.';
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
    }, 900);
  };

  return (
    <section id="meet-solace" className="relative py-24 px-6 lg:px-12 bg-[#FAF8F4] border-t border-slate-200/60 overflow-hidden">
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs mb-3">
            <span className="text-[10px] font-mono font-medium text-teal-700">[ + ] Clinical dialogue</span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-xs text-slate-600">Daily guidance</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-medium text-[#193653] tracking-tight leading-tight mb-4">
            Daily skin companion that listens and guides
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Solace synthesizes visual skin scans, daily reflections, and sleep rhythms into calm, evidence-informed dialogue that prepares structured summaries for doctor visits.
          </p>
        </div>

        {/* Mascot & Chat Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Mascot in Peaceful & Attentive Listening Pose (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="relative z-10">
                <MascotPeaceful size={260} />
              </div>

              {/* Status Badge */}
              <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-mono text-[#193653]">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>Solace telemetry online</span>
              </div>
            </div>

            {/* Micro feature cards */}
            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-sm">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-left">
                <Heart className="w-4 h-4 text-teal-700 mb-1" />
                <div className="text-xs font-medium text-[#193653]">Empathetic tone</div>
                <div className="text-[11px] text-slate-500">Non-alarmist reassurance</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-left">
                <FileCheck className="w-4 h-4 text-teal-700 mb-1" />
                <div className="text-xs font-medium text-[#193653]">Doctor-aligned</div>
                <div className="text-[11px] text-slate-500">Prepares structured briefs</div>
              </div>
            </div>
          </div>

          {/* Right: Conversational Interface (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 max-w-xl mx-auto flex flex-col h-[500px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#193653] flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium text-[#193653] flex items-center space-x-1.5">
                      <span>Solace guidance assistant</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        Contextual
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">Continuous barrier memory</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>Ready</span>
                </div>
              </div>

              {/* Message History Container */}
              <div className="flex-1 overflow-y-auto py-3.5 space-y-3 pr-1 text-left">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#193653] text-white shadow-2xs'
                            : 'bg-slate-50 text-[#193653] border border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        <p className="font-normal">{msg.text}</p>
                        <span
                          className={`block text-[9px] font-mono mt-1 text-right ${
                            isUser ? 'text-white/60' : 'text-slate-400'
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-500 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Prompt Pills */}
              <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-100 flex-shrink-0">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(p)}
                    className="text-[11px] text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
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
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-[#193653] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <button
                  onClick={() => handleSendPrompt()}
                  aria-label="Send message"
                  className="w-8 h-8 rounded-lg bg-[#193653] hover:bg-[#234A70] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
