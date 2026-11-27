import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Link2 } from 'lucide-react';
import { reportsApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { shortHash } from '../../utils/hash';
import { ChainStatusBadge } from './ChainStatusBadge';

const POLL_MS = 2500;

/** The patient's issued reports and their on-chain status. Polls while any are pending. */
export function IssuedReports({ refreshKey }) {
  const { data, reload } = useAsync(() => reportsApi.issued(), [refreshKey]);
  const reports = data?.reports || [];
  const registry = data?.registry;
  const pending = reports.some((r) => r.chain.status === 'pending' || r.chain.status === 'failed');

  useEffect(() => {
    if (!pending) return undefined;
    const id = setInterval(reload, POLL_MS);
    return () => clearInterval(id);
  }, [pending, reload]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-[#8A9AA0] uppercase font-semibold tracking-wider">
        <span>Issued reports</span>
        {registry && (
          <span className="normal-case tracking-normal font-medium flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            {registry.enabled ? registry.network : 'Blockchain off — fingerprints kept by Dermora'}
          </span>
        )}
      </div>
      {reports.length === 0 ? (
        <p className="text-[11px] text-[#8A9AA0]">Download a report to create a verifiable copy for your doctor.</p>
      ) : (
        <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto">
          {reports.map((r) => (
            <div key={r.id} className="py-1.5 flex items-center gap-2 text-[11px]">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#1F2A2E]">{new Date(r.issuedAt).toLocaleString()}</div>
                <div className="text-[10px] text-[#8A9AA0] font-mono truncate" title={r.sha256}>
                  SHA-256 {shortHash(r.sha256)}
                </div>
              </div>
              <ChainStatusBadge status={r.chain.status} title={r.chain.error || undefined} />
              {r.chain.txUrl && (
                <a href={r.chain.txUrl} target="_blank" rel="noreferrer" className="text-[#0F3B3F] hover:underline flex items-center gap-0.5">
                  Tx <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <Link to={`/verify/${r.id}`} target="_blank" className="font-semibold text-[#0F3B3F] hover:underline">
                Verify
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
