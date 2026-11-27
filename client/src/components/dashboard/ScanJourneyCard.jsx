import React from 'react';
import {
  AlertTriangle, ArrowRight, Camera, CheckCircle2, ClipboardCheck, Database, FileText, Loader2, RefreshCcw,
  ScanLine, Sparkles, Stethoscope, TrendingDown
} from 'lucide-react';
import phoneScan from '../../assets/extracted/phone_scan.png';
import { RESCAN_AFTER_DAYS } from '../../utils/areas';
import { dateTime, daysSince, formatSlot, relativeDays, signed } from '../../utils/format';

const THEMES = {
  'first-scan': 'from-[#0F3B3F] to-[#1F6A66] text-white',
  'finish-checkin': 'from-[#2C4A6B] to-[#4C6E91] text-white',
  attention: 'from-[#7A3B1E] to-[#B4602F] text-white',
  'rescan-due': 'from-[#4B3A78] to-[#7E64B8] text-white',
  'scanned-today': 'from-[#1E5A3A] to-[#2E8B57] text-white',
  baseline: 'from-[#0F3B3F] to-[#3F7A72] text-white',
  'on-track': 'from-[#0F3B3F] to-[#2F6F69] text-white'
};

function Cta({ onClick, icon: Icon, children, variant = 'solid', disabled }) {
  const base =
    'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-wait';
  const style =
    variant === 'solid'
      ? 'bg-white text-[#0F3B3F] hover:bg-[#F2F7F6] shadow-sm'
      : 'bg-white/10 text-white border border-white/30 hover:bg-white/20';
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${style}`}>
      {Icon && <Icon className={`w-3.5 h-3.5 ${disabled ? 'animate-spin' : ''}`} />}
      {children}
    </button>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{label}</div>
      <div className="text-lg font-bold leading-tight truncate">{value}</div>
      {sub && <div className="text-[10px] opacity-75 truncate">{sub}</div>}
    </div>
  );
}

function DeltaChip({ value, unit = '', label }) {
  if (value === null || value === undefined) return null;
  const better = value <= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${better ? 'bg-emerald-400/25' : 'bg-amber-300/30'}`}>
      {label} {signed(value, Number.isInteger(value) ? 0 : 1)}
      {unit}
    </span>
  );
}

/** The dashboard's lead widget: tells the patient the one thing to do next. */
export function ScanJourneyCard({ state, areas, scanCount, onScan, onOpenScan, onBook, onOpenReport, onFillDemo, demoBusy }) {
  const { kind, area } = state;
  const latest = area?.latest;
  const daysLeft = area ? Math.max(RESCAN_AFTER_DAYS - daysSince(area.latest.createdAt), 0) : null;
  const progress = area ? Math.min(daysSince(area.latest.createdAt) / RESCAN_AFTER_DAYS, 1) : 0;

  let icon = ScanLine;
  let eyebrow = '';
  let title = '';
  let body = null;
  let actions = null;

  switch (kind) {
    case 'first-scan':
      eyebrow = 'Get started';
      title = 'Scan your skin';
      body = 'Take a clear photo of the affected area. Our AI measures its size, redness and borders, then tracks how it changes every time you re-scan.';
      actions = (
        <>
          <Cta onClick={() => onScan()} icon={Camera}>Start your first scan</Cta>
          <Cta onClick={onFillDemo} icon={demoBusy ? Loader2 : Database} variant="ghost" disabled={demoBusy}>
            {demoBusy ? 'Loading demo…' : 'Fill demo data'}
          </Cta>
        </>
      );
      break;
    case 'finish-checkin':
      icon = ClipboardCheck;
      eyebrow = 'Almost done';
      title = `Finish today's check-in for ${area.name}`;
      body = 'Answer a few quick questions about itch, spreading and stress so we can give you a personalised consultation.';
      actions = (
        <>
          <Cta onClick={() => onOpenScan(state.scan)} icon={ArrowRight}>Answer 4 questions</Cta>
          <Cta onClick={() => onScan()} icon={Camera} variant="ghost">Scan another area</Cta>
        </>
      );
      break;
    case 'attention':
      icon = AlertTriangle;
      eyebrow = 'Needs attention';
      title = `${area.name} is getting worse`;
      body = area.vsPrevious
        ? `Severity rose ${signed(area.vsPrevious.severity)} points and the area changed ${signed(area.vsPrevious.areaCm2, 1)} cm² since the previous scan. We recommend seeing a specialist.`
        : 'Your last check-in suggests a specialist should take a look soon.';
      actions = (
        <>
          <Cta onClick={onBook} icon={Stethoscope}>Book a specialist</Cta>
          <Cta onClick={() => onScan(area.name)} icon={RefreshCcw} variant="ghost">Re-scan {area.name}</Cta>
        </>
      );
      break;
    case 'rescan-due':
      icon = RefreshCcw;
      eyebrow = 'Follow-up due';
      title = `Time to re-scan ${area.name}`;
      body = `Last scanned ${relativeDays(latest.createdAt)}. Use the same angle and lighting so the AI can measure the difference accurately.`;
      actions = (
        <>
          <Cta onClick={() => onScan(area.name)} icon={Camera}>Re-scan {area.name}</Cta>
          <Cta onClick={() => onScan()} icon={ScanLine} variant="ghost">New area</Cta>
        </>
      );
      break;
    case 'scanned-today':
      icon = CheckCircle2;
      eyebrow = "Today's scan is done";
      title = area.vsPrevious
        ? area.vsPrevious.severity <= 0
          ? `${area.name} is improving`
          : `${area.name} changed since last time`
        : `${area.name} baseline recorded`;
      body = (
        <span className="flex flex-wrap items-center gap-1.5">
          <span>
            {latest.conditionDisplay} · severity {latest.severityScore}/100 · {latest.areaCm2} cm² · scanned{' '}
            {dateTime(latest.createdAt)}
          </span>
          <DeltaChip label="Severity" value={area.vsPrevious?.severity} />
          <DeltaChip label="Area" value={area.vsPrevious?.areaCm2} unit=" cm²" />
        </span>
      );
      actions = (
        <>
          <Cta onClick={onOpenReport} icon={FileText}>View today's doctor report</Cta>
          <Cta onClick={() => onScan()} icon={Camera} variant="ghost">Scan another area</Cta>
        </>
      );
      break;
    case 'baseline':
      icon = Sparkles;
      eyebrow = 'Baseline saved';
      title = `Re-scan ${area.name} in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
      body = 'Your first measurement is stored. A second scan of the same area unlocks before/after comparison and change tracking.';
      actions = (
        <>
          <Cta onClick={() => onScan(area.name)} icon={Camera}>Scan {area.name} now</Cta>
          <Cta onClick={() => onScan()} icon={ScanLine} variant="ghost">Track another area</Cta>
        </>
      );
      break;
    default:
      icon = TrendingDown;
      eyebrow = 'On track';
      title = `Next scan of ${area.name} in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
      body = area.vsBaseline
        ? `Since your first scan: severity ${signed(area.vsBaseline.severity)}, area ${signed(area.vsBaseline.areaCm2, 1)} cm² (${signed(area.vsBaseline.areaPct, 0)}%).`
        : 'Keep following your plan.';
      actions = (
        <>
          <Cta onClick={() => onScan(area.name)} icon={Camera}>Scan now</Cta>
          <Cta onClick={onOpenReport} icon={FileText} variant="ghost">Today's report</Cta>
        </>
      );
  }

  const Icon = icon;

  return (
    <section
      className={`relative overflow-hidden rounded-[18px] bg-gradient-to-br ${THEMES[kind]} p-5 sm:p-6 shadow-md border border-white/10`}
      aria-live="polite"
    >
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider opacity-85">
            <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5" />
            </span>
            {eyebrow}
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight mt-2 leading-tight">{title}</h2>
          <div className="text-xs sm:text-[13px] opacity-90 mt-1.5 max-w-2xl leading-relaxed">{body}</div>
          <div className="flex flex-wrap gap-2 mt-4">{actions}</div>
        </div>

        {kind === 'first-scan' ? (
          <div className="hidden sm:flex items-center gap-4 lg:w-[380px] shrink-0">
            <ol className="space-y-2 text-[11px] font-medium opacity-95">
              {['Photograph the area in daylight', 'AI measures size, redness & borders', 'Re-scan to see the difference'].map(
                (t, i) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    {t}
                  </li>
                )
              )}
            </ol>
            <img src={phoneScan} alt="" className="w-28 h-auto drop-shadow-xl" />
          </div>
        ) : (
          <div className="lg:w-[400px] shrink-0 grid grid-cols-3 gap-3 bg-white/10 rounded-2xl p-3.5 border border-white/15">
            <Stat label="Areas tracked" value={areas.length} sub={`${scanCount} scan${scanCount === 1 ? '' : 's'} total`} />
            <Stat label="Last scan" value={relativeDays(areas[0].latest.createdAt)} sub={dateTime(areas[0].latest.createdAt)} />
            <Stat
              label="Next visit"
              value={state.upcoming ? formatSlot(state.upcoming.date).split(' · ')[0] : '—'}
              sub={state.upcoming ? state.upcoming.doctor : 'None booked'}
            />
            {area && (
              <div className="col-span-3">
                <div className="flex justify-between text-[10px] font-semibold opacity-80">
                  <span>Re-scan cycle · {area.name}</span>
                  <span>{daysLeft === 0 ? 'Due now' : `${daysLeft}d left`}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 mt-1 overflow-hidden">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
