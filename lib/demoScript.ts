// Single source of truth for the scripted demo. Shared by the DemoController
// (staging + on-screen text), the Narrator (text-to-speech), and the
// GuidedCursor (which element to point at / highlight each step).

export interface DemoStep {
  title: string;
  /** On-screen narration text. */
  narration: string;
  /** Text-to-speech friendly variant (expands symbols / acronyms). */
  speech: string;
  emoji: string;
  /**
   * data-tour selector(s) to point the guided cursor at. When an array, the
   * first selector that currently exists in the DOM wins — this lets a step
   * follow an element that appears mid-animation (e.g. the SOS panel).
   */
  focus: string | string[] | null;
  /** Extra dwell (ms) after speech ends before auto-play advances. */
  autoDelayMs: number;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    title: 'The Ocean Has No Addresses',
    narration:
      'On land, everything has an address. At sea, every point is nameless. That single fact is why coordinating rescue is so hard.',
    speech:
      'On land, everything has an address. At sea, every point is nameless. That single fact is why coordinating a rescue is so hard.',
    emoji: '🌊',
    focus: null,
    autoDelayMs: 1200,
  },
  {
    title: 'Meet the Fleet',
    narration:
      "Five boats fishing off Tamil Nadu's coast. No NavIC hardware. No satellite device. Just a smartphone and a 4G signal that dies 3 km out.",
    speech:
      'Five boats fishing off the Tamil Nadu coast. No Navic hardware, no satellite device. Just a smartphone, and a four G signal that dies three kilometers out.',
    emoji: '⛵',
    focus: '[data-tour="fleet"]',
    autoDelayMs: 1200,
  },
  {
    title: 'The Mesh Forms',
    narration:
      'Each phone pairs with a ₹1,500 LoRa node on a 2 m mast — the same low-power radio used in IoT sensors. Boats within range hear each other peer-to-peer: no server, no satellite.',
    speech:
      'Each phone pairs with a fifteen hundred rupee Laura radio node on a two meter mast, the same low power radio used in Internet of Things sensors. Boats within range hear each other, peer to peer. No server, no satellite.',
    emoji: '📡',
    focus: '[data-tour="fleet"]',
    autoDelayMs: 1400,
  },
  {
    title: 'Network Fails',
    narration:
      'Signal lost. A boat with no neighbours in range is not lost — DTN buffers its distress message and carries it forward when the next boat drifts by. Eventual connectivity, not real-time.',
    speech:
      'Signal lost. But a boat with no neighbors in range is not lost. Delay tolerant networking buffers its distress message, and carries it forward when the next boat drifts by. Eventual connectivity, not real time.',
    emoji: '📵',
    focus: ['[data-tour="dtn"]', '[data-tour="network-toggle"]'],
    autoDelayMs: 1600,
  },
  {
    title: 'SOS — No Signal',
    narration:
      "Arjun's engine fails offshore. A BFS relay hops his cell code boat-to-boat to shore — each hop is local, so even at 50,000 boats it computes in under 5 ms thanks to H3 spatial indexing.",
    speech:
      "Arjun's engine fails offshore. A breadth first relay hops his cell code, boat to boat, until it reaches shore. Each hop is local, so even at fifty thousand boats it computes in under five milliseconds, thanks to H three spatial indexing.",
    emoji: '🆘',
    focus: ['[data-tour="sos-panel"]', '[data-tour="sos"]'],
    autoDelayMs: 4500,
  },
  {
    title: 'The Border',
    narration:
      'Near the IMBL we drop to H3 resolution 8 — cells shrink from 36 km² to 0.74 km², 49× more precise. A crossing of just ~860 m trips the alert. Resolution adapts to the stakes.',
    speech:
      'Near the maritime border, we drop to H three resolution eight. Cells shrink from thirty six square kilometers to under one, forty nine times more precise. A crossing of just eight hundred meters trips the alert. Resolution adapts to the stakes.',
    emoji: '🚨',
    focus: ['[data-tour="border-legend"]', '[data-tour="toggle-showBorderZone"]'],
    autoDelayMs: 2400,
  },
  {
    title: 'Ocean Memory',
    narration:
      "Every hazard fishermen discover — reefs, ghost nets, wrecks — gets tagged to a cell. The ocean's first shared memory. Free. Permanent. Crowd-built.",
    speech:
      "Every hazard fishermen discover, reefs, ghost nets, wrecks, gets tagged to a cell. The ocean's first shared memory. Free, permanent, and crowd built.",
    emoji: '🗺',
    focus: '[data-tour="toggle-showHazardMap"]',
    autoDelayMs: 1600,
  },
  {
    title: 'The Storm',
    narration:
      'IMD says "Tamil Nadu coast — high alert." SagarGrid says "Your cell SG-7A3F2 is in the direct danger zone." That precision saves lives.',
    speech:
      'The weather office says: Tamil Nadu coast, high alert. Sagar Grid says: your exact cell is in the direct danger zone. That precision saves lives.',
    emoji: '🌀',
    focus: '[data-tour="toggle-showWeatherOverlay"]',
    autoDelayMs: 1800,
  },
  {
    title: 'One Address for Every Wave',
    narration:
      "India's NavIC system protects the boats that can afford the hardware. SagarGrid gives every other boat a free addressing layer — and turns fishermen from people we warn into people who warn each other.",
    speech:
      "India's Navic system protects the boats that can afford the hardware. Sagar Grid gives every other boat a free addressing layer, and turns fishermen from people we warn, into people who warn each other.",
    emoji: '🇮🇳',
    focus: '[data-tour="toggles"]',
    autoDelayMs: 1500,
  },
];
