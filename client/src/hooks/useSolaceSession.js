import { useCallback, useRef, useState } from 'react';
import { solaceApi } from '../api';
import { browserTtsSupported, speakText, stopSpeaking } from '../utils/speech';

/**
 * Turn-based Solace conversation.
 * phase: 'idle' | 'starting' | 'active' | 'thinking' | 'ending' | 'ended'
 */
export function useSolaceSession() {
  const [phase, setPhase] = useState('idle');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [capabilities, setCapabilities] = useState({ speechToText: false, textToSpeech: false });
  const [speak, setSpeakState] = useState(true);
  const speakRef = useRef(true);
  const [safety, setSafety] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const silence = useCallback(() => {
    audioRef.current?.pause();
    stopSpeaking();
  }, []);

  const setSpeak = useCallback(
    (update) => {
      const next = typeof update === 'function' ? update(speakRef.current) : update;
      speakRef.current = next;
      setSpeakState(next);
      if (!next) silence();
    },
    [silence]
  );

  /** Speak a reply: server audio when provided, otherwise the browser's built-in voice. */
  const voice = useCallback(
    (text, base64, mime = 'audio/wav') => {
      if (!speakRef.current) return;
      silence();
      if (base64) {
        audioRef.current = new Audio(`data:${mime};base64,${base64}`);
        audioRef.current.play().catch(() => speakText(text)); // autoplay blocked -> try browser voice
      } else {
        speakText(text);
      }
    },
    [silence]
  );

  const handleTurn = useCallback(
    (res) => {
      setMessages((m) => [...m, { role: 'agent', text: res.reply }]);
      if (res.safety) setSafety(res.safety);
      voice(res.reply, res.audioBase64, res.audioMimeType);
    },
    [voice]
  );

  const start = useCallback(async () => {
    setPhase('starting');
    setError(null);
    setSafety(null);
    try {
      const s = await solaceApi.start(speak);
      setSession(s);
      setCapabilities(s.capabilities);
      setMessages([{ role: 'agent', text: s.greeting }]);
      voice(s.greeting, s.audioBase64, s.audioMimeType);
      setPhase('active');
    } catch (err) {
      setError(err.message);
      setPhase('idle');
    }
  }, [voice, speak]);

  const sendText = useCallback(
    async (text) => {
      if (!session || !text.trim()) return;
      setMessages((m) => [...m, { role: 'user', text: text.trim() }]);
      setPhase('thinking');
      setError(null);
      try {
        handleTurn(await solaceApi.sendText(session.id, text.trim(), speak && capabilities.textToSpeech));
      } catch (err) {
        setError(err.message);
      } finally {
        setPhase('active');
      }
    },
    [session, speak, capabilities.textToSpeech, handleTurn]
  );

  const sendAudio = useCallback(
    async (blob) => {
      if (!session || !blob?.size) return;
      setPhase('thinking');
      setError(null);
      try {
        const res = await solaceApi.sendAudio(session.id, blob, speak && capabilities.textToSpeech);
        setMessages((m) => [...m, { role: 'user', text: res.transcript }]);
        handleTurn(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setPhase('active');
      }
    },
    [session, speak, capabilities.textToSpeech, handleTurn]
  );

  const end = useCallback(async () => {
    if (!session) return;
    silence();
    setPhase('ending');
    try {
      const ended = await solaceApi.end(session.id);
      setSession(ended);
      if (ended.safety) setSafety(ended.safety);
      setPhase('ended');
    } catch (err) {
      setError(err.message);
      setPhase('active');
    }
  }, [session, silence]);

  const reset = useCallback(() => {
    silence();
    setPhase('idle');
    setSession(null);
    setMessages([]);
    setSafety(null);
    setError(null);
  }, [silence]);

  // Spoken replies work with server TTS or, as a fallback, the browser's voice.
  const canSpeakReplies = capabilities.textToSpeech || browserTtsSupported;

  return {
    canSpeakReplies, phase, session, messages, capabilities, speak, setSpeak, safety, error, start, sendText, sendAudio, end, reset };
}
