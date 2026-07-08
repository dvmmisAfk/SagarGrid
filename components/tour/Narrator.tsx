'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useVoiceStore, pickBestVoice } from '@/store/voiceStore';
import { DEMO_STEPS } from '@/lib/demoScript';

// Strip symbols / punctuation that make TTS engines stumble or mispronounce.
function sanitize(text: string): string {
  return text
    .replace(/[—–]/g, ', ')
    .replace(/·/g, ', ')
    .replace(/×/g, ' times ')
    .replace(/²/g, ' squared')
    .replace(/°/g, ' degrees ')
    .replace(/₹/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim();
}

// AI voice narrator using the browser-native Web Speech API. No API keys, no
// network — works fully offline, which matters for an at-sea / venue demo.
export default function Narrator() {
  const demoMode = useUIStore((s) => s.demoMode);
  const demoStep = useUIStore((s) => s.demoStep);
  const narrationEnabled = useUIStore((s) => s.narrationEnabled);
  const narrationNonce = useUIStore((s) => s.narrationNonce);

  const voices = useVoiceStore((s) => s.voices);
  const selectedVoiceURI = useVoiceStore((s) => s.selectedVoiceURI);
  const setVoices = useVoiceStore((s) => s.setVoices);
  const setSelectedVoiceURI = useVoiceStore((s) => s.setSelectedVoiceURI);

  // Load voices (async in most browsers) and auto-select the clearest one.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      if (!list.length) return;
      setVoices(list);
      if (!useVoiceStore.getState().selectedVoiceURI) {
        const best = pickBestVoice(list);
        if (best) setSelectedVoiceURI(best.voiceURI);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [setVoices, setSelectedVoiceURI]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    if (!demoMode || !narrationEnabled) return;
    const step = DEMO_STEPS[demoStep];
    if (!step) return;

    const voice =
      voices.find((v) => v.voiceURI === selectedVoiceURI) ?? pickBestVoice(voices) ?? null;

    let cancelled = false;

    // Speak sentence-by-sentence: gives natural pauses and avoids some engines
    // truncating or rushing long utterances.
    const sentences = sanitize(step.speech || step.narration)
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);

    const speakFrom = (i: number) => {
      if (cancelled || i >= sentences.length) {
        if (!cancelled && i >= sentences.length) onAllDone();
        return;
      }
      const u = new SpeechSynthesisUtterance(sentences[i]);
      u.rate = 0.94;
      u.pitch = 1.02;
      u.volume = 1;
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.onend = () => {
        if (!cancelled) speakFrom(i + 1);
      };
      u.onerror = () => {
        if (!cancelled) speakFrom(i + 1);
      };
      synth.speak(u);
    };

    const onAllDone = () => {
      // Hands-free mode: advance to the next step after a short dwell.
      if (useUIStore.getState().autoPlay && useUIStore.getState().demoMode) {
        window.setTimeout(() => {
          if (useUIStore.getState().autoPlay && useUIStore.getState().demoMode) {
            window.dispatchEvent(new CustomEvent('sagargrid:demo-next'));
          }
        }, step.autoDelayMs ?? 1200);
      }
    };

    // Small delay so the preceding cancel() settles (Chrome quirk).
    const t = window.setTimeout(() => speakFrom(0), 140);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      synth.cancel();
    };
  }, [demoMode, demoStep, narrationEnabled, narrationNonce, voices, selectedVoiceURI]);

  return null;
}
