// Browser text-to-speech (Web Speech API) — used for Solace's spoken replies when the
// server has no Gemini TTS model configured.

export const browserTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

const PREFERRED_VOICES = /Jenny|Aria|Zira|Samantha|Google UK English Female|Microsoft.*Natural|Female/i;

function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('en'));
  return voices.find((v) => PREFERRED_VOICES.test(v.name)) || voices[0] || null;
}

export function speakText(text) {
  if (!browserTtsSupported || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // a touch slower feels calmer
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (browserTtsSupported) window.speechSynthesis.cancel();
}
