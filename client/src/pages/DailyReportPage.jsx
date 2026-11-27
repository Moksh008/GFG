import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, FileDown, Loader2, Printer } from 'lucide-react';
import { reportsApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useReportExport } from '../hooks/useReportExport';
import { ErrorBanner, Spinner } from '../components/ui/Feedback';
import { TrendChart } from '../components/ui/TrendChart';
import { dateTime, shortDate, signed, severityColor } from '../utils/format';

function shiftDay(iso, by) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + by);
  return d.toISOString().slice(0, 10);
}

/** Today's UTC date — report days are UTC dates on the server. */
function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function longDate(iso) {
  return new Date(`${iso}T00:00`).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function Section({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0F3B3F] border-b-2 border-[#0F3B3F] pb-1 mb-2.5">{title}</h2>
      {children}
    </section>
  );
}

function Delta({ value, digits = 0, unit = '', lowerIsBetter = true }) {
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>;
  const better = lowerIsBetter ? value < 0 : value > 0;
  const flat = value === 0;
  return (
    <span className={`font-semibold ${flat ? 'text-slate-500' : better ? 'text-emerald-700' : 'text-amber-700'}`}>
      {signed(value, digits)}
      {unit}
    </span>
  );
}

const th = 'text-left text-[10px] uppercase tracking-wider text-[#647C7C] font-bold py-1.5 px-2 bg-[#F1F6F5]';
const td = 'py-1.5 px-2 border-t border-slate-100 align-top';

/** Printable end-of-day report for the treating doctor. Use ?date=YYYY-MM-DD for past days. */
export default function DailyReportPage() {
  const [params, setParams] = useSearchParams();
  const date = params.get('date') || undefined;
  const { data: r, error, loading, reload } = useAsync(() => reportsApi.daily(date), [date]);
  const { exportDailyReport, exporting } = useReportExport();
  const goTo = (d) => setParams(d ? { date: d } : {});
  const isLatest = r && r.date >= todayUtc();

  return (
    <div className="min-h-screen bg-[#E9EFEE] print:bg-white text-[#1F2A2E]">
      {/* Toolbar (hidden when printing) */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 print:hidden">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2">
          <Link to="/dashboard" className="h-8 px-3 rounded-full hover:bg-slate-100 text-xs font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          {r && (
            <div className="flex items-center gap-1 mx-auto sm:mx-0 sm:ml-2">
              <button type="button" onClick={() => goTo(shiftDay(r.date, -1))} aria-label="Previous day" className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold min-w-[110px] text-center">{shortDate(`${r.date}T12:00`)}</span>
              <button
                type="button"
                onClick={() => goTo(shiftDay(r.date, 1))}
                disabled={isLatest}
                aria-label="Next day"
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={() => window.print()} className="h-8 px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={() => exportDailyReport(r?.date)}
              disabled={!r || exporting}
              className="h-8 px-3 rounded-full bg-[#0F3B3F] hover:bg-[#1F6A66] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Download a fingerprinted PDF your doctor can verify"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} Verified PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 print:p-0">
        <ErrorBanner error={error} onRetry={reload} />
        {loading && !r ? (
          <Spinner label="Building report…" className="py-24" />
        ) : r ? (
          <article className="bg-white rounded-2xl print:rounded-none shadow-sm print:shadow-none border border-slate-200 print:border-0 p-4 sm:p-8 space-y-6 text-[12px]">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#3F5F4A]">Dermora.ai · Daily report for doctor</div>
                <h1 className="text-xl sm:text-2xl font-semibold mt-1">{longDate(r.date)}</h1>
                <p className="text-[11px] text-[#8A9AA0] mt-0.5">Generated {dateTime(r.generatedAt)} · day boundaries in UTC</p>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                <dt className="text-[#8A9AA0]">Patient</dt>
                <dd className="font-semibold">{r.patient.name || r.patient.email}</dd>
                <dt className="text-[#8A9AA0]">Date of birth</dt>
                <dd className="font-semibold">{r.patient.dateOfBirth || '—'}</dd>
                <dt className="text-[#8A9AA0]">Condition</dt>
                <dd className="font-semibold">{r.patient.primaryCondition || '—'}</dd>
                <dt className="text-[#8A9AA0]">Skin type</dt>
                <dd className="font-semibold">{r.patient.skinType || '—'}</dd>
              </dl>
            </header>

            <Section title="Summary">
              <p className="text-[13px] leading-relaxed">{r.summary}</p>
              {r.flags.length > 0 && (
                <ul className="mt-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1 text-amber-900">
                  {r.flags.map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Scans recorded this day">
              {r.scansToday.length === 0 ? (
                <p className="text-[#8A9AA0]">No scans were taken on this day.</p>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full min-w-[560px] border border-slate-100 rounded-lg">
                    <thead>
                      <tr>
                        {['Time', 'Body area', 'Finding', 'Severity', 'Redness', 'Area', 'Change vs previous'].map((h) => (
                          <th key={h} className={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.scansToday.map((s) => (
                        <tr key={s.scanId}>
                          <td className={td}>{new Date(s.takenAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</td>
                          <td className={`${td} font-semibold`}>{s.bodyArea}</td>
                          <td className={td}>
                            {s.condition} <span className="text-[#8A9AA0]">({Math.round(s.confidence * 100)}%)</span>
                            <div className="text-[10px] text-[#8A9AA0]">{s.status}</div>
                          </td>
                          <td className={td}>{s.severityScore}/100</td>
                          <td className={td}>{s.rednessIndex}%</td>
                          <td className={td}>{s.areaCm2} cm²</td>
                          <td className={td}>
                            {s.vsPrevious ? (
                              <span className="space-x-2">
                                <span>Sev <Delta value={s.vsPrevious.severity} /></span>
                                <span>Area <Delta value={s.vsPrevious.areaCm2} digits={1} unit=" cm²" /></span>
                                <span className="text-[#8A9AA0]">over {s.vsPrevious.days}d</span>
                              </span>
                            ) : (
                              <span className="text-[#8A9AA0]">First scan of this area</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section title="Tracked areas · progress since first scan">
              {r.areas.length === 0 ? (
                <p className="text-[#8A9AA0]">No body areas tracked yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {r.areas.map((a) => (
                    <div key={a.bodyArea} className="rounded-xl border border-slate-200 p-3 break-inside-avoid">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-[13px] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor(a.latest.severityScore) }} />
                            {a.bodyArea}
                          </div>
                          <div className="text-[10px] text-[#8A9AA0]">
                            {a.scanCount} scans since {shortDate(a.firstScanAt)} · last {dateTime(a.latest.takenAt)}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100">{a.latest.status}</span>
                      </div>
                      <table className="w-full mt-2 text-[11px]">
                        <thead>
                          <tr>
                            <th className={th}>Metric</th>
                            <th className={th}>Latest</th>
                            <th className={th}>vs previous</th>
                            <th className={th}>vs first</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className={td}>Area</td>
                            <td className={td}>{a.latest.areaCm2} cm²</td>
                            <td className={td}><Delta value={a.vsPrevious?.areaCm2} digits={1} unit=" cm²" /></td>
                            <td className={td}><Delta value={a.vsBaseline?.areaPct} unit="%" /></td>
                          </tr>
                          <tr>
                            <td className={td}>Severity</td>
                            <td className={td}>{a.latest.severityScore}/100</td>
                            <td className={td}><Delta value={a.vsPrevious?.severity} /></td>
                            <td className={td}><Delta value={a.vsBaseline?.severity} /></td>
                          </tr>
                          <tr>
                            <td className={td}>Redness</td>
                            <td className={td}>{a.latest.rednessIndex}%</td>
                            <td className={td}><Delta value={a.vsPrevious?.redness} unit="%" /></td>
                            <td className={td}><Delta value={a.vsBaseline?.redness} unit="%" /></td>
                          </tr>
                        </tbody>
                      </table>
                      {a.timeline.length > 1 && (
                        <div className="mt-2">
                          <div className="text-[10px] font-semibold text-[#647C7C]">Affected area (cm²) per scan</div>
                          <TrendChart
                            height={110}
                            points={a.timeline.map((t) => ({
                              label: shortDate(t.takenAt),
                              value: t.areaCm2,
                              color: severityColor(t.severityScore),
                              detailTitle: dateTime(t.takenAt),
                              detail: `Severity ${t.severityScore}`
                            }))}
                            formatValue={(v) => `${Number(v).toFixed(1)} cm²`}
                            ariaLabel={`Affected area of ${a.bodyArea} per scan`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Medication & dosage">
              {r.medications.items.length === 0 ? (
                <p className="text-[#8A9AA0]">No active medications.</p>
              ) : (
                <>
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full min-w-[520px] border border-slate-100">
                      <thead>
                        <tr>
                          {['Medicine', 'Dosage', 'Schedule', 'For', 'Taken'].map((h) => (
                            <th key={h} className={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {r.medications.items.map((m) => (
                          <tr key={m.name}>
                            <td className={`${td} font-semibold`}>{m.name}</td>
                            <td className={td}>{m.dosage}</td>
                            <td className={td}>{m.frequency} · {m.timing}</td>
                            <td className={td}>{m.area || '—'}</td>
                            <td className={`${td} font-bold ${m.taken >= m.expected ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {m.taken}/{m.expected}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#647C7C]">
                    Doses this day: <strong>{r.medications.taken}/{r.medications.expected}</strong>
                    {r.medications.adherence7d != null && <> · 7-day adherence: <strong>{r.medications.adherence7d}%</strong></>}
                  </p>
                </>
              )}
            </Section>

            <Section title="Mood & symptoms">
              {r.mood.length === 0 ? (
                <p className="text-[#8A9AA0]">No mood check-in on this day.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {r.mood.map((m) => (
                    <React.Fragment key={m.loggedAt}>
                      {[
                        ['Mood', `${m.mood}/10`],
                        ['Stress', `${m.stress}/10`],
                        ['Itch', m.itch == null ? '—' : `${m.itch}/10`],
                        ['Sleep', m.sleepHours == null ? '—' : `${m.sleepHours} h`]
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-[#F6F9F8] border border-slate-100 p-2">
                          <div className="text-[10px] uppercase font-bold text-[#8A9AA0]">{k}</div>
                          <div className="text-[15px] font-bold">{v}</div>
                        </div>
                      ))}
                      {(m.emotions.length > 0 || m.triggers.length > 0 || m.note) && (
                        <p className="col-span-2 sm:col-span-4 text-[11px] text-[#647C7C]">
                          {new Date(m.loggedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} ·{' '}
                          {[...m.emotions, ...m.triggers.map((t) => `trigger: ${t}`)].join(', ')} {m.note && `— “${m.note}”`}
                        </p>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </Section>

            {r.appointments.length > 0 && (
              <Section title="Upcoming appointments">
                <ul className="space-y-1">
                  {r.appointments.map((a) => (
                    <li key={`${a.doctor}-${a.when}`}>
                      <strong>{a.when}</strong> — {a.doctor} ({a.department}) · {a.type}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <footer className="pt-3 border-t border-slate-200 text-[10px] text-[#8A9AA0]">
              {r.disclaimer} Use “Verified PDF” for a tamper-evident copy your doctor can check at /verify.
            </footer>
          </article>
        ) : null}
      </div>
    </div>
  );
}
