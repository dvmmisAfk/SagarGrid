import { create } from 'zustand';

interface VoiceStore {
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  setVoices: (voices: SpeechSynthesisVoice[]) => void;
  setSelectedVoiceURI: (uri: string | null) => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  voices: [],
  selectedVoiceURI: null,
  setVoices: (voices) => set({ voices }),
  setSelectedVoiceURI: (uri) => set({ selectedVoiceURI: uri }),
}));

// Rank English voices by expected clarity. Neural / Natural / Online voices
// (Edge, macOS premium) sound far better than the default local ones.
export function rankVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;
  if (!/^en/.test(lang)) score -= 100;
  if (/natural|neural/.test(name)) score += 50;
  if (/online/.test(name)) score += 20;
  if (/google/.test(name)) score += 30;
  if (/(aria|jenny|guy|libby|sonia|ryan|michelle|ana)/.test(name)) score += 15; // MS neural
  if (/en-in/.test(lang)) score += 12;
  if (/en-gb/.test(lang)) score += 8;
  if (/en-us/.test(lang)) score += 6;
  if (/zira|david|mark|hazel/.test(name)) score -= 5; // older local MS voices
  return score;
}

export function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  if (!pool.length) return null;
  return [...pool].sort((a, b) => rankVoice(b) - rankVoice(a))[0];
}
