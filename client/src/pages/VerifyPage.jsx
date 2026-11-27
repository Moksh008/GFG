import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ExternalLink, FileCheck2, Loader2, Plus, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import { reportsApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { sha256Hex, shortHash } from '../utils/hash';

const VERDICTS = {
  verified: {
    icon: ShieldCheck,
    cls: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    title: 'Authentic and unaltered',
    body: 'This exact file was issued by Dermora and its fingerprint is recorded on the blockchain.'
  },
  registered: {
    icon: FileCheck2,
    cls: 'bg-sky-50 border-sky-200 text-sky-900',
    title: 'Issued by Dermora',
    body: "This exact file matches a report in Dermora's records. Blockchain confirmation is pending or not enabled."
  },
  issuer_revoked: {
    icon: AlertTriangle,
    cls: 'bg-amber-50 border-amber-200 text-amber-900',
    title: 'Issuer no longer trusted',
    body: 'The fingerprint is on-chain, but the wallet that recorded it has since been revoked. Treat with caution.'
  },
  not_found: {
    icon: ShieldAlert,
    cls: 'bg-rose-50 border-rose-200 text-rose-900',
    title: 'Not recognised',
    body: 'This file was modified after it was issued, or it was not issued by Dermora.'
  },
  mismatch: {
    icon: ShieldAlert,
    cls: 'bg-rose-50 border-rose-200 text-rose-900',
    title: 'Does not match this report',
    body: 'The file you chose is not the report with this ID. It may have been altered.'
  }
};

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-xs border-b border-black/5 last:border-0">
      <span className="text-[#647C7C]">{label}</span>
      <span className="font-medium text-right break-all">{children}</span>
    </div>
  );
}

function ResultCard({ result, fileName }) {
  const v = VERDICTS[result.verdict];
  const Icon = v.icon;
  const chain = result.onChain;
  const reg = result.registry;
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${v.cls}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-7 h-7 shrink-0" />
        <div>
          <div className="text-base font-semibold">{v.title}</div>
          <p className="text-xs opacity-80">{v.body}</p>
        </div>
      </div>
      <div className="bg-white/70 rounded-xl p-3">
        {fileName && <Row label="File">{fileName}</Row>}
        <Row label="SHA-256">
          <span className="font-mono" title={result.sha256}>{shortHash(result.sha256, 16)}</span>
        </Row>
        {result.report && (
          <>
            <Row label="Report ID">{result.report.id}</Row>
            <Row label="Issued">{new Date(result.report.issuedAt).toLocaleString()}</Row>
            {result.report.issuedTo && <Row label="Patient">{result.report.issuedTo}</Row>}
          </>
        )}
        {chain?.anchored && (
          <>
            <Row label="Recorded on-chain">{new Date(chain.anchoredAt).toLocaleString()}</Row>
            <Row label="Network">{reg?.network}</Row>
            {result.report?.txHash && (
              <Row label="Transaction">
                {result.report.txUrl ? (
                  <a href={result.report.txUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                    {shortHash(result.report.txHash)} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="font-mono">{shortHash(result.report.txHash)}</span>
                )}
              </Row>
            )}
            <Row label="Registry contract">
              {reg?.contractUrl ? (
                <a href={reg.contractUrl} target="_blank" rel="noreferrer" className="underline font-mono">{shortHash(reg.contract)}</a>
              ) : (
                <span className="font-mono">{shortHash(reg?.contract)}</span>
              )}
            </Row>
          </>
        )}
      </div>
      {reg?.mode === 'local' && (
        <p className="text-[10px] opacity-70">Note: this server uses a local development chain, which resets when the server restarts.</p>
      )}
    </div>
  );
}

/** Public page — no sign-in. Doctors drop the PDF here; only its fingerprint is checked. */
export default function VerifyPage() {
  const { reportId } = useParams();
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const expected = useAsync(() => (reportId ? reportsApi.verifyId(reportId) : Promise.resolve(null)), [reportId]);

  const check = async (file) => {
    if (!file) return;
    setChecking(true);
    setError(null);
    setResult(null);
    setFileName(file.name);
    try {
      const hash = await sha256Hex(file);
      const res = await reportsApi.verifyHash(hash);
      const mismatch = expected.data && expected.data.sha256 !== hash;
      setResult(mismatch ? { ...res, verdict: 'mismatch' } : res);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    check(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#6F8FA3] via-[#A9C1CC] to-[#DCEBE8] flex items-start sm:items-center justify-center p-4 text-[#1F2A2E]">
      <div className="w-full max-w-lg py-6">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#0F3B3F]">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">
            Dermora<span className="font-normal opacity-90">.ai</span>
          </span>
        </Link>

        <div className="bg-white/95 rounded-[28px] p-6 sm:p-7 shadow-2xl border border-white/70 space-y-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Verify a Dermora report</h1>
            <p className="text-xs text-[#8A9AA0] mt-1">
              Check that a patient's PDF report is genuine and hasn't been changed since it was issued.
            </p>
          </div>

          {reportId && (
            <div className="text-xs rounded-xl bg-slate-50 border border-slate-100 p-3">
              {expected.loading && 'Looking up report…'}
              {expected.error && <span className="text-rose-700">{expected.error.message}</span>}
              {expected.data?.report && (
                <>
                  Report <span className="font-mono">{reportId.slice(0, 8)}</span> was issued on{' '}
                  <strong>{new Date(expected.data.report.issuedAt).toLocaleDateString()}</strong>
                  {expected.data.report.issuedTo && <> to <strong>{expected.data.report.issuedTo}</strong></>}. Drop the PDF you
                  received to confirm it is this exact file.
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-2 text-center transition cursor-pointer ${
              dragging ? 'border-[#1F6A66] bg-[#DCEBE8]/60' : 'border-[#A9C1CC] bg-[#DCEBE8]/20 hover:bg-[#DCEBE8]/40'
            }`}
          >
            {checking ? <Loader2 className="w-8 h-8 text-[#1F6A66] animate-spin" /> : <Upload className="w-8 h-8 text-[#1F6A66]" />}
            <span className="text-sm font-semibold">{checking ? 'Checking…' : 'Drop the report PDF here'}</span>
            <span className="text-[11px] text-[#8A9AA0]">or click to choose a file</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              check(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          {error && <p className="text-xs text-rose-700">{error}</p>}
          {result && <ResultCard result={result} fileName={fileName} />}

          <p className="text-[10px] text-[#8A9AA0] text-center">
            🔒 Your file never leaves this device — only its SHA-256 fingerprint is checked. No patient data is stored on the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}
