import { useCallback, useState } from 'react';
import { reportsApi } from '../api';
import { downloadBlob } from '../utils/format';
import { useToast } from './useToast';

/**
 * Downloads the server-generated, doctor-ready PDFs (full history or a single day). Each download
 * is a new report whose fingerprint the server records on-chain; `exportCount` lets report lists refresh.
 */
export function useReportExport() {
  const showToast = useToast();
  const [exporting, setExporting] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  const run = useCallback(
    async (fetchPdf, filename) => {
      setExporting(true);
      try {
        downloadBlob(await fetchPdf(), filename);
        showToast('Report downloaded — its fingerprint is being recorded for verification.');
        setExportCount((n) => n + 1);
      } catch (err) {
        showToast(`Could not generate report: ${err.message}`, 'error');
      } finally {
        setExporting(false);
      }
    },
    [showToast]
  );

  const exportReport = useCallback(
    () => run(() => reportsApi.pdf(), `dermora-report-${new Date().toISOString().slice(0, 10)}.pdf`),
    [run]
  );

  /** `date` is the report day (YYYY-MM-DD); omitted = today. */
  const exportDailyReport = useCallback(
    (date) => run(() => reportsApi.dailyPdf(date), `dermora-daily-report-${date || new Date().toISOString().slice(0, 10)}.pdf`),
    [run]
  );

  return { exportReport, exportDailyReport, exporting, exportCount };
}
