import { useCallback, useState } from 'react';
import { insightsApi } from '../api';
import { downloadBlob } from '../utils/format';
import { useToast } from './useToast';

/** Downloads the server-generated, doctor-ready PDF report. */
export function useReportExport() {
  const showToast = useToast();
  const [exporting, setExporting] = useState(false);

  const exportReport = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await insightsApi.reportPdf();
      downloadBlob(blob, `dermora-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('Doctor-ready PDF report downloaded.');
    } catch (err) {
      showToast(`Could not generate report: ${err.message}`, 'error');
    } finally {
      setExporting(false);
    }
  }, [showToast]);

  return { exportReport, exporting };
}
