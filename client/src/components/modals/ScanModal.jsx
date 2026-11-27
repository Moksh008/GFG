import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Check, Loader2, MapPin, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { skinApi } from '../../api';
import { Modal } from '../ui/Modal';
import { buttonClass, inputClass, labelClass } from '../ui/classes';
import { ScanResult } from '../scans/ScanResult';
import { QuestionnaireForm } from '../scans/QuestionnaireForm';
import { ConsultationCard } from '../scans/ConsultationCard';

const AREA_SUGGESTIONS = ['Left Forearm', 'Right Forearm', 'Face', 'Neck', 'Scalp', 'Back', 'Left Hand', 'Right Hand', 'Left Leg', 'Right Leg'];
const SUBTITLES = {
  capture: 'DINOv2 ViT-B/14 analysis · eczema, psoriasis, vitiligo',
  result: 'Review the AI analysis before saving',
  questions: 'A few questions for a personalised consultation',
  consult: 'Saved to your clinical history'
};

/**
 * Capture -> AI result -> (save) -> follow-up questionnaire -> consultation.
 * /skin/detect persists immediately; discarding at the result step deletes it again.
 */
export default function ScanModal({ isOpen, onClose, onSaved, defaultBodyArea, knownAreas = [] }) {
  const [step, setStep] = useState('capture');
  // null = not edited yet, so the field follows the most recently scanned area.
  const [editedArea, setEditedArea] = useState(null);
  const bodyArea = editedArea ?? defaultBodyArea ?? '';
  const setBodyArea = setEditedArea;
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scan, setScan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const reset = () => {
    setStep('capture');
    setFile(null);
    setPreview(null);
    setScan(null);
    setError(null);
    setNotes('');
    setEditedArea(null);
  };

  const discard = async () => {
    if (scan && step === 'result') await skinApi.remove(scan.id).catch(() => {});
  };

  const close = async () => {
    await discard();
    reset();
    onClose();
  };

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const analyse = async () => {
    if (!file) return setError('Please take or upload a photo of the affected area first.');
    if (!bodyArea.trim()) return setError('Name the body area so future scans of it can be compared.');
    setBusy(true);
    setError(null);
    try {
      setScan(await skinApi.detect({ file, bodyArea: bodyArea.trim(), notes: notes.trim() }));
      setStep('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    onSaved(scan);
    setStep('questions');
  };

  const submitAnswers = async (answers) => {
    try {
      setScan(await skinApi.submitQuestionnaire(scan.id, answers));
      setStep('consult');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="New Skin Scan" subtitle={SUBTITLES[step]} icon={Camera}>
      <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickFile} />

      {step === 'capture' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#A9C1CC] rounded-2xl p-4 bg-[#DCEBE8]/20 flex flex-col items-center text-center">
            {preview ? (
              <img src={preview} alt="Skin capture preview" className="w-full h-48 object-cover rounded-xl shadow-inner mb-3" />
            ) : (
              <div className="w-full h-48 rounded-xl mb-3 flex flex-col items-center justify-center text-[#8A9AA0] text-xs gap-2 bg-white/60">
                <Camera className="w-8 h-8 text-[#A9C1CC]" />
                Photograph the affected area in natural daylight, ~15 cm away
              </div>
            )}
            <div className="flex items-center gap-3">
              <button type="button" className={buttonClass.pill} onClick={() => uploadRef.current?.click()}>
                <Upload className="w-3.5 h-3.5" /> Upload photo
              </button>
              <button type="button" className={buttonClass.pill} onClick={() => cameraRef.current?.click()}>
                <Camera className="w-3.5 h-3.5" /> Take photo
              </button>
            </div>
          </div>

          <div>
            <label className={`${labelClass} flex items-center gap-1`} htmlFor="scan-area">
              <MapPin className="w-3.5 h-3.5 text-[#3F5F4A]" /> Body area
            </label>
            <input id="scan-area" className={inputClass} value={bodyArea} onChange={(e) => setBodyArea(e.target.value)} placeholder="e.g. Left Forearm" />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {knownAreas.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setBodyArea(a)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                    bodyArea === a ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-[#DCEBE8]/60 text-[#0F3B3F] border-[#A9C1CC]'
                  }`}
                  title="Previously scanned — progress will be compared"
                >
                  ↻ {a}
                </button>
              ))}
              {AREA_SUGGESTIONS.filter((a) => !knownAreas.some((k) => k.toLowerCase() === a.toLowerCase())).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setBodyArea(a)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${
                    bodyArea === a ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#8A9AA0] mt-1">Use the same name each time so the change in size and redness can be measured.</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="scan-notes">Notes / symptoms</label>
            <textarea
              id="scan-notes"
              rows={2}
              className={`${inputClass} resize-none`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Itching, burning, recent triggers…"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="bg-[#FAFBFB] p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3F5F4A] mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-[#8A9AA0]">
              <strong>Clinical safeguard:</strong> AI observations support tracking and are not a diagnosis. Measurements are
              estimates from your photo — see a dermatologist for anything worsening or concerning.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={close} className={buttonClass.ghost}>Cancel</button>
            <button type="button" onClick={analyse} disabled={busy} className={buttonClass.primary}>
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#F2C98A]" />}
              {busy ? 'Analysing…' : 'Run AI analysis'}
            </button>
          </div>
        </div>
      )}

      {step === 'result' && scan && (
        <div className="space-y-4">
          <ScanResult scan={scan} />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={async () => {
                await discard();
                setScan(null);
                setStep('capture');
              }}
              className={buttonClass.ghost}
            >
              Discard & retake
            </button>
            <button type="button" onClick={save} className={buttonClass.success}>
              <Check className="w-3.5 h-3.5" /> Save to history
            </button>
          </div>
        </div>
      )}

      {step === 'questions' && scan && (
        <>
          {error && <p className="text-xs text-red-700 mb-2">{error}</p>}
          <QuestionnaireForm questions={scan.questionnaire} onSubmit={submitAnswers} onSkip={close} />
        </>
      )}

      {step === 'consult' && scan && (
        <div className="space-y-4">
          <ConsultationCard consultation={scan.consultation} />
          <div className="flex justify-end">
            <button type="button" onClick={close} className={buttonClass.primary}>Done</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
