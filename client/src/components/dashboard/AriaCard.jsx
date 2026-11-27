import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Camera, FileDown, Mic, Sparkles } from 'lucide-react';
import { chatApi } from '../../api';

const SUGGESTIONS = ['Is my skin improving?', 'Why is it itchy?', 'Did I take my meds today?'];

function helplineText(safety) {
  return safety.helplines.map((h) => `${h.name} (${h.region}): ${h.contact}`).join(' · ');
}

/** Aria — the text assistant. History persists server-side; refreshes after each new scan. */
export function AriaCard({ scanCount, onExportReport, onOpenScan }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    chatApi
      .history()
      .then((h) => active && setMessages(h.messages))
      .catch(() => active && setMessages([{ sender: 'aria', text: 'I can’t reach the Dermora server right now.' }]));
    return () => {
      active = false;
    };
  }, [scanCount]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = async (text = query) => {
    const message = text.trim();
    if (!message || isTyping) return;
    setMessages((prev) => [...prev, { sender: 'user', text: message }]);
    setQuery('');
    setIsTyping(true);
    try {
      const res = await chatApi.send(message);
      const extra = res.safety ? [{ sender: 'aria', text: helplineText(res.safety) }] : [];
      setMessages((prev) => [...prev, res.message, ...extra]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'aria', text: `Sorry, I couldn’t respond (${err.message}).` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[340px] rounded-[14px] p-4 text-[#1F2A2E] flex flex-col justify-between relative overflow-hidden border border-[#A9C1CC] shadow-md bg-[#C8E5E4]">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img
          src="/flower.jpg"
          alt=""
          className="w-auto h-full max-h-[340px] object-contain opacity-80 mix-blend-multiply"
          style={{
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)'
          }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F2C98A] via-[#B98CE8] to-[#2FBF71] z-20" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[24px] font-light tracking-tight text-[#0F3B3F] leading-none">Aria</h2>
            <span className="w-2 h-2 rounded-full bg-[#2FBF71]" />
          </div>
          <button
            type="button"
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-[#0F3B3F] text-[10px] font-bold rounded-full border border-slate-200 shadow-xs transition cursor-pointer"
            title="Download a doctor-ready PDF report"
          >
            <FileDown className="w-3 h-3" />
            <span>Export PDF</span>
          </button>
        </div>
        <p className="text-[11px] text-[#2F5452] font-semibold mt-0.5">Your personal AI skin assistant</p>
      </div>

      <div ref={scrollRef} className="relative z-10 my-1 flex flex-col min-h-[90px] max-h-[110px] overflow-y-auto pr-1">
        <div className="space-y-1.5 mt-auto">
          {messages.map((m, i) => (
            <div
              key={m.id ?? `local-${i}`}
              className={`text-[11px] leading-relaxed p-2.5 rounded-xl shadow-xs w-fit max-w-[92%] ${
                m.sender === 'user' ? 'ml-auto bg-[#0F3B3F] text-white' : 'bg-white text-[#1F2A2E] border border-slate-200'
              }`}
            >
              {m.text}
            </div>
          ))}
          {isTyping && (
            <div className="text-[10px] text-[#0F3B3F] font-semibold italic flex items-center gap-1 bg-white/70 px-2 py-1 rounded-md w-fit">
              <Sparkles className="w-3 h-3 animate-spin" /> Aria is thinking…
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-1.5 mb-1.5 overflow-x-auto no-scrollbar">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-[#0F3B3F] whitespace-nowrap shadow-2xs transition cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="relative z-10 bg-white rounded-xl p-2 border border-slate-200 shadow-xs flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about your skin…"
          className="w-full text-xs bg-transparent py-1 pl-1 pr-20 text-[#1F2A2E] placeholder-[#8A9AA0] focus:outline-none"
        />
        <div className="absolute right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenScan}
            className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#647C7C] cursor-pointer"
            title="New skin scan"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/solace')}
            className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#647C7C] cursor-pointer"
            title="Talk to Solace (voice)"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
          <button
            type="submit"
            disabled={isTyping}
            className="w-6 h-6 rounded-full bg-[#0F3B3F] hover:bg-[#1F6A66] text-white flex items-center justify-center transition shadow-xs cursor-pointer disabled:opacity-50"
            aria-label="Send"
          >
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </div>
  );
}
