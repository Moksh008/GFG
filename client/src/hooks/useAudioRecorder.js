import { useCallback, useEffect, useRef, useState } from 'react';

const PREFERRED_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

/** Microphone recorder built on MediaRecorder. `stop()` resolves with the recorded Blob. */
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const resolveRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices;

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = (recorder.mimeType || 'audio/webm').split(';')[0];
        resolveRef.current?.(new Blob(chunksRef.current, { type }));
        resolveRef.current = null;
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setError('Microphone access was blocked. Allow mic permission and try again.');
    }
  }, []);

  const stop = useCallback(
    () =>
      new Promise((resolve) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') return resolve(null);
        resolveRef.current = resolve;
        recorder.stop();
        recorderRef.current = null;
        setIsRecording(false);
      }),
    []
  );

  // Release the mic if the component unmounts mid-recording.
  useEffect(() => () => recorderRef.current?.state === 'recording' && recorderRef.current.stop(), []);

  return { isSupported, isRecording, error, start, stop };
}
