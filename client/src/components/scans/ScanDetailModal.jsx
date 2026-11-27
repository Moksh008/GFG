import React, { useState } from 'react';
import { ArrowLeftRight, FileSearch, Trash2 } from 'lucide-react';
import { skinApi } from '../../api';
import { Modal } from '../ui/Modal';
import { buttonClass } from '../ui/classes';
import { ScanResult } from './ScanResult';
import { QuestionnaireForm } from './QuestionnaireForm';
import { ConsultationCard } from './ConsultationCard';

/** Full detail for one saved scan: result, consultation (or questionnaire), compare and delete. */
export function ScanDetailModal({ scan, onClose, onChanged, onDeleted, onCompare }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(null);
  if (!scan) return null;

  const submitAnswers = async (answers) => {
    try {
      onChanged(await skinApi.submitQuestionnaire(scan.id, answers));
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    try {
      await skinApi.remove(scan.id);
      onDeleted(scan.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="xl" icon={FileSearch} title={scan.bodyArea} subtitle={`${scan.date} · ${scan.relativeTime}`}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {scan.imageUrl && <img src={scan.imageUrl} alt={`Scan of ${scan.bodyArea}`} className="w-full h-64 object-cover rounded-2xl border border-slate-200" />}
          {scan.notes && (
            <p className="text-xs text-[#1F2A2E] bg-slate-50 border border-slate-100 rounded-xl p-3">
              <strong>Notes:</strong> {scan.notes}
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => onCompare(scan)} className={buttonClass.pill}>
              <ArrowLeftRight className="w-3.5 h-3.5" /> Compare with previous
            </button>
            {confirmDelete ? (
              <button type="button" onClick={remove} className={`${buttonClass.pill} !bg-rose-600 !text-white !border-rose-600`}>
                Confirm delete
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className={`${buttonClass.pill} text-rose-600`}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
          {error && <p className="text-xs text-rose-700">{error}</p>}
        </div>

        <div className="space-y-4">
          <ScanResult scan={scan} />
          {scan.consultation ? (
            <ConsultationCard consultation={scan.consultation} />
          ) : (
            <div>
              <div className="text-sm font-semibold mb-2">Get a personalised consultation</div>
              <QuestionnaireForm questions={scan.questionnaire || []} onSubmit={submitAnswers} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
