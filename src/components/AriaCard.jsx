import React, { useState } from 'react';
import { Paperclip, Mic, ArrowUp, Sparkles, FileDown } from 'lucide-react';

export function AriaCard({ onExportReport }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'aria',
      text: 'Good morning Alex. Your Right Forearm scan shows 21% reduction in papular erythema. Ready to compare lesion margins or export your clinical PDF?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend) => {
    const messageText = textToSend || query;
    if (!messageText.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: messageText }];
    setMessages(newMsgs);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (messageText.toLowerCase().includes('itch') || messageText.toLowerCase().includes('why')) {
        reply = 'Pruritus is settling as the epithelial barrier rebuilds. Keep applying prescribed ceramide balm.';
      } else if (messageText.toLowerCase().includes('pdf') || messageText.toLowerCase().includes('report')) {
        reply = 'I am assembling your encrypted clinical PDF dossier now. Tap "Export PDF" above.';
      } else {
        reply = 'Longitudinal observations confirm steady resolution. Re-scan scheduled in 3 days.';
      }

      setMessages([...newMsgs, { sender: 'aria', text: reply }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div 
      className="h-[340px] rounded-[14px] p-4 text-[#1F2A2E] flex flex-col justify-between relative overflow-hidden border border-[#A9C1CC] shadow-md"
      style={{
        backgroundColor: '#C8E5E4'
      }}
    >
      {/* Centered, unstretched flower graphic cleanly blending */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img
          src="/flower.jpg"
          alt="Aria Floral Glow"
          className="w-auto h-full max-h-[340px] object-contain opacity-80 mix-blend-multiply"
          style={{
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)'
          }}
        />
      </div>

      {/* Solid tri-color accent line along bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F2C98A] via-[#B98CE8] to-[#2FBF71] z-20" />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[24px] font-light tracking-tight text-[#0F3B3F] leading-none">Aria</h2>
            <span className="w-2 h-2 rounded-full bg-[#2FBF71]"></span>
          </div>
          <button
            type="button"
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-[#0F3B3F] text-[10px] font-bold rounded-full border border-slate-200 shadow-xs transition cursor-pointer"
            title="Export Doctor-Ready Clinical Dossier"
          >
            <FileDown className="w-3 h-3 text-[#0F3B3F]" />
            <span>Export PDF</span>
          </button>
        </div>
        <p className="text-[11px] text-[#2F5452] font-semibold mt-0.5">Your personal AI skin assistant</p>
      </div>

      {/* Middle: Conversation Box */}
      <div className="relative z-10 my-1 flex flex-col justify-end min-h-[90px] max-h-[110px] overflow-y-auto pr-1">
        <div className="space-y-1.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-[11px] leading-relaxed p-2.5 rounded-xl shadow-xs ${
                m.sender === 'user'
                  ? 'ml-auto bg-[#0F3B3F] text-white text-right'
                  : 'bg-white text-[#1F2A2E] border border-slate-200'
              }`}
            >
              {m.text}
            </div>
          ))}
          {isTyping && (
            <div className="text-[10px] text-[#0F3B3F] font-semibold italic flex items-center gap-1 bg-white/70 px-2 py-1 rounded-md w-fit">
              <Sparkles className="w-3 h-3 animate-spin text-[#0F3B3F]" /> Aria is analyzing skin metrics...
            </div>
          )}
        </div>
      </div>

      {/* 2 suggestion chips (Solid White Buttons) */}
      <div className="relative z-10 flex items-center gap-1.5 mb-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleSend('Why is it itchy?')}
          className="text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-[#0F3B3F] whitespace-nowrap shadow-2xs transition cursor-pointer"
        >
          Why is it itchy?
        </button>

        <button
          type="button"
          onClick={() => handleSend('Improving recovery today?')}
          className="text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-[#0F3B3F] whitespace-nowrap shadow-2xs transition cursor-pointer"
        >
          Improving recovery today?
        </button>
      </div>

      {/* Bottom Input Card: Solid White */}
      <div className="relative z-10 bg-white rounded-xl p-2 text-[#1F2A2E] border border-slate-200 shadow-xs flex flex-col justify-between h-[68px]">
        <div className="flex items-center justify-between text-[10px] px-1">
          <span className="text-[#647C7C] font-semibold">100 Credits Remaining</span>
          <span className="text-[9px] font-bold text-[#0F3B3F] bg-slate-100 px-1.5 py-0.2 rounded-full cursor-pointer hover:bg-slate-200">
            Upgrade
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your skin…"
            className="w-full text-xs bg-transparent py-0.5 pl-1 pr-18 text-[#1F2A2E] placeholder-[#8A9AA0] focus:outline-none"
          />

          <div className="absolute right-0 flex items-center gap-1">
            <button
              type="button"
              className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#647C7C] cursor-pointer"
              title="Attach photo"
            >
              <Paperclip className="w-3 h-3" />
            </button>
            <button
              type="button"
              className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#647C7C] cursor-pointer"
              title="Voice note"
            >
              <Mic className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleSend()}
              className="w-6 h-6 rounded-full bg-[#0F3B3F] hover:bg-[#1F6A66] text-white flex items-center justify-center transition shadow-xs cursor-pointer"
            >
              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
