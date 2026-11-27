import React from 'react';
import { Link } from 'react-router-dom';
import { AudioLines } from 'lucide-react';
import { solaceApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { shortDate, signed } from '../../utils/format';

/** Teaser for the Solace voice companion with the most recent session's takeaway. */
export function SolaceCard() {
  const { data: sessions } = useAsync(() => solaceApi.sessions(), []);
  const last = sessions?.find((s) => s.status === 'ended' && s.summary);

  return (
    <div className="h-[300px] rounded-[14px] p-4 flex flex-col justify-between text-white shadow-md border border-[#2F5452] bg-gradient-to-br from-[#0F3B3F] via-[#1F6A66] to-[#3F5F4A] relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#B98CE8]/25 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <AudioLines className="w-5 h-5 text-[#F2C98A]" />
          <h3 className="text-[22px] font-light tracking-tight leading-none">Solace</h3>
        </div>
        <p className="text-[11px] text-white/80 font-medium mt-1">A voice companion for the mind–skin connection</p>
      </div>

      <div className="relative bg-white/10 rounded-xl p-3 border border-white/15 text-[11px] leading-relaxed min-h-[96px]">
        {last ? (
          <>
            <div className="flex items-center justify-between text-[10px] text-white/70 font-semibold mb-1">
              <span>Last session · {shortDate(last.startedAt)}</span>
              {last.moodChange != null && <span>Mood {signed(last.moodChange)}</span>}
            </div>
            <p className="line-clamp-4">{last.summary}</p>
          </>
        ) : (
          <p className="text-white/85">
            Talk through stress, itch and how your skin makes you feel. Solace adapts to your recent mood and scans, and
            logs how you felt afterwards.
          </p>
        )}
      </div>

      <Link
        to="/solace"
        className="relative self-start px-4 py-2 rounded-full bg-white text-[#0F3B3F] text-xs font-bold hover:bg-[#F2C98A] transition shadow-sm"
      >
        Start a session →
      </Link>
    </div>
  );
}
