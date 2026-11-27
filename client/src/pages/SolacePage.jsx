import React, { useEffect, useRef, useState } from 'react';
import { AudioLines, Loader2, Mic, Send, Square, Volume2, VolumeX } from 'lucide-react';
import { solaceApi } from '../api';
import { AppShell } from '../components/layout/AppShell';
import { SafetyNotice } from '../components/ui/Feedback';
import { buttonClass } from '../components/ui/classes';
import { useAsync } from '../hooks/useAsync';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSolaceSession } from '../hooks/useSolaceSession';
import { shortDate, signed } from '../utils/format';

const PROFILE_LABELS = {
  'crisis-aware': 'Gentle check-in',
  'stress-relief': 'Stress relief',
  'flare-support': 'Flare support',
  maintenance: 'Keeping steady',
  supportive: 'Open conversation'
};

function Bubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`max-w-[80%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl shadow-xs ${isUser ? 'ml-auto bg-[#0F3B3F] text-white rounded-br-md' : 'bg-white text-[#1F2A2E] border border-slate-200 rounded-bl-md'}`}>
      {text}
    </div>
  );
}

function Intro({ onStart, starting, error }) {
  return (
    <div className="text-center max-w-md mx-auto py-10 space-y-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0F3B3F] to-[#3F5F4A] text-[#F2C98A] flex items-center justify-center mx-auto shadow-lg">
        <AudioLines className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-semibold">Talk it through with Solace</h2>
      <p className="text-xs text-[#8A9AA0] leading-relaxed">
        Solace is a calm, supportive voice companion. It adapts to your recent mood and skin, helps with stress and the
        itch–scratch cycle, and logs how you're feeling when you finish. It isn't a therapist — if you're in crisis,
        please contact a helpline or emergency services.
      </p>
      {error && <p className="text-xs text-rose-700">{error}</p>}
      <button type="button" onClick={onStart} disabled={starting} className={`${buttonClass.primary} !px-6 !py-2.5`}>
        {starting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Start a session
      </button>
    </div>
  );
}

function SessionSummary({ session, onRestart }) {
  return (
    <div className="max-w-xl mx-auto py-6 space-y-4">
      <h2 className="text-lg font-semibold text-center">Session summary</h2>
      {session.preMoodScore != null && session.postMoodScore != null && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <span>Mood before <strong>{session.preMoodScore}/10</strong></span>→
          <span>after <strong>{session.postMoodScore}/10</strong></span>
          <span className={`text-xs font-bold ${session.moodChange >= 0 ? 'text-[#2FBF71]' : 'text-amber-600'}`}>({signed(session.moodChange)})</span>
        </div>
      )}
      <p className="text-sm leading-relaxed bg-[#DCEBE8]/50 border border-[#A9C1CC]/50 rounded-2xl p-4">{session.summary}</p>
      {session.insights.length > 0 && (
        <ul className="space-y-1.5">
          {session.insights.map((i) => (
            <li key={i} className="text-xs flex gap-2"><span className="text-[#3F5F4A]">✦</span>{i}</li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-[#8A9AA0] text-center">This session was added to your mood journal.</p>
      <div className="text-center">
        <button type="button" onClick={onRestart} className={buttonClass.primary}>Start another session</button>
      </div>
    </div>
  );
}

function PastSessions() {
  const { data } = useAsync(() => solaceApi.sessions(), []);
  const past = (data || []).filter((s) => s.status === 'ended');
  return (
    <div className="solid-card">
      <h3 className="text-sm font-semibold mb-2">Past sessions</h3>
      {past.length === 0 ? (
        <p className="text-[11px] text-[#8A9AA0]">Your completed sessions will appear here.</p>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
          {past.map((s) => (
            <div key={s.id} className="py-2">
              <div className="flex justify-between text-[11px] text-[#8A9AA0] font-semibold">
                <span>{shortDate(s.startedAt)} · {PROFILE_LABELS[s.promptProfile] || s.promptProfile}</span>
                {s.moodChange != null && <span>Mood {signed(s.moodChange)}</span>}
              </div>
              <p className="text-xs text-[#1F2A2E] line-clamp-3 mt-0.5">{s.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SolacePage() {
  const solace = useSolaceSession();
  const recorder = useAudioRecorder();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const busy = solace.phase === 'thinking' || solace.phase === 'ending';
  const canSpeak = solace.capabilities.speechToText && recorder.isSupported;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [solace.messages, solace.phase]);

  const toggleMic = async () => {
    if (recorder.isRecording) solace.sendAudio(await recorder.stop());
    else recorder.start();
  };

  const submitText = (e) => {
    e.preventDefault();
    solace.sendText(draft);
    setDraft('');
  };

  const inSession = ['active', 'thinking', 'ending'].includes(solace.phase);

  return (
    <AppShell title="Solace" subtitle="Your wellbeing companion for the mind–skin connection">
      <div className="grid grid-cols-12 gap-2.5">
        <div className="col-span-12 lg:col-span-8 solid-card min-h-[560px] flex flex-col">
          {(solace.phase === 'idle' || solace.phase === 'starting') && (
            <Intro onStart={solace.start} starting={solace.phase === 'starting'} error={solace.error} />
          )}

          {solace.phase === 'ended' && solace.session && <SessionSummary session={solace.session} onRestart={solace.reset} />}

          {inSession && (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2FBF71] animate-pulse" />
                  <span className="text-sm font-semibold">Session in progress</span>
                  <span className="text-[10px] font-semibold bg-[#DCEBE8] text-[#1F6A66] px-2 py-0.5 rounded-full">
                    {PROFILE_LABELS[solace.session?.promptProfile] || 'Open conversation'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {solace.canSpeakReplies && (
                    <button
                      type="button"
                      onClick={() => solace.setSpeak((v) => !v)}
                      className={buttonClass.subtle}
                      title={solace.speak ? 'Mute spoken replies' : 'Speak replies aloud'}
                    >
                      {solace.speak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button type="button" onClick={solace.end} disabled={busy} className={buttonClass.subtle}>
                    {solace.phase === 'ending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />} End session
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-2.5 max-h-[400px]">
                {solace.messages.map((m, i) => (
                  <Bubble key={i} {...m} />
                ))}
                {solace.phase === 'thinking' && (
                  <div className="text-xs text-[#8A9AA0] italic flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Solace is listening…
                  </div>
                )}
              </div>

              <SafetyNotice resources={solace.safety} />
              {(solace.error || recorder.error) && <p className="text-xs text-rose-700 mt-2">{solace.error || recorder.error}</p>}

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {canSpeak && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={busy}
                    title={recorder.isRecording ? 'Stop and send' : 'Tap to speak'}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition shadow-md cursor-pointer disabled:opacity-50 ${
                      recorder.isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#0F3B3F] text-white hover:bg-[#1F6A66]'
                    }`}
                  >
                    {recorder.isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                <form onSubmit={submitText} className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={busy || recorder.isRecording}
                    placeholder={recorder.isRecording ? 'Recording… tap the button to send' : 'Type a message…'}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <button type="submit" disabled={busy || !draft.trim()} className="text-[#0F3B3F] disabled:opacity-40 cursor-pointer" aria-label="Send">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
              {!solace.capabilities.speechToText && (
                <p className="text-[10px] text-[#8A9AA0] mt-2">Voice input is available once the server has a Gemini API key — text works now.</p>
              )}
            </>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4">
          <PastSessions key={solace.phase === 'ended' ? solace.session?.id : 'list'} />
        </div>
      </div>
    </AppShell>
  );
}
