# SagarGrid

**An address for every wave.**

SagarGrid is a web prototype that gives every patch of ocean a unique, human-readable address and lets small fishing boats — the ones left out of India's paid NavIC satellite system — share locations, relay SOS signals boat-to-boat with **no network**, receive precise border/hazard/weather warnings, and collectively build a crowd-sourced hazard map.

Built for hackathon demos. Everything runs **client-side and in-memory** — no backend, no database, no real radio hardware.

---

## Quick Start

```bash
npm install          # first time only
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve production build
```

Open **http://localhost:3000** in your browser. Hard-refresh (Ctrl+F5) if you see an unstyled page after restarting the dev server.

---

## What It Does

| Feature | Description |
|---|---|
| **Ocean Grid** | Seamless H3 hex tessellation over the Bay of Bengal — every cell gets a short code like `SG-L7ETJ` |
| **Boat Mesh** | 5 simulated boats form a peer-to-peer mesh within radio range; mesh links update live |
| **SOS Relay** | One-tap distress call hops boat-to-boat via BFS until it reaches shore — **0 network used** |
| **Border Zone** | Distance-based IMBL geofence in the Palk Strait — warns before accidental crossings |
| **Hazard Map** | 3 crowd-reported hazards with AI trust scores; right-click any ocean cell to tag new ones |
| **Weather Overlay** | Cell-precise cyclone severity rings (danger / watch / advisory) |
| **DTN Panel** | Store-Carry-Forward messaging when a boat has no mesh neighbors |
| **Offline Map** | Bundled vector coastline survives with zero internet when tiles are hidden |
| **Demo Mode** | Scripted 9-step walkthrough with **AI voice narration** and **guided cursor** |
| **Coverage Planner** | Deployment heatmap at 5% / 20% / 50% adoption levels |

---

## Demo Walkthrough

1. Click **▶ Demo Mode** in the top bar.
2. Narration starts automatically; a guided cursor points at each UI element being described.
3. Use **Next / Back** to step through, or hit **▶ Auto** for a fully hands-free narrated pitch.
4. Controls in the demo box: **🔊** mute, **↻** replay, **▶ Auto** autoplay, **Voice** dropdown to pick the clearest TTS voice.

### Manual highlights

- **🆘 SOS** — triggers the full boat-to-boat relay animation
- **Kill Network** — hides tiles, shows offline vector map, activates DTN
- **Border Zone / Hazard Map / Weather** — toggle overlays in the bottom-right panel
- **📡 Range** — switch between Bluetooth, LoRa, and VHF presets; mesh links update live
- **Right-click** any ocean cell — tag a hazard
- **Freeze** — pause boat movement for clean screenshots

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router, TypeScript) |
| Map | Leaflet 1.9 + react-leaflet 4.2 |
| Grid | Uber H3 (h3-js 4.5) — `polygonToCells` tessellation |
| Animation | Framer Motion 12 + HTML5 Canvas (SOS arcs) |
| State | Zustand 5 (8 stores) |
| Voice | Web Speech API (browser-native TTS, offline-capable) |
| Styling | Tailwind CSS 3.4 — dark ocean theme |

---

## Project Structure

```
sagargrid/
├── app/                    # Next.js App Router (page, layout, globals.css)
├── components/
│   ├── map/                # Leaflet layers (grid, boats, hazards, weather, coastline)
│   ├── panels/             # Slide-in panels (cell info, SOS, DTN, alerts)
│   ├── controls/           # TopBar, fleet list, toggles, SOS, demo, radio range
│   └── tour/               # AI narrator + guided cursor
├── lib/                    # H3 utils, boat engine, SOS relay, land/sea, hazards, demo script
├── store/                  # Zustand stores (boats, UI, SOS, grid, DTN, voice, map)
└── types/                  # Shared TypeScript interfaces
```

---

## Key Design Decisions

- **Seamless grid** — `h3.polygonToCells()` fills the entire viewport with tessellated hexagons (no gaps).
- **Land vs ocean** — point-in-polygon classification; land cells labeled **LAND**, border/hazards never bleed onto land.
- **Border geofence** — distance-to-polyline along the IMBL in open water, not coarse H3 cell blobs.
- **Zoom-adaptive resolution** — H3-5 at zoom 7 → H3-8 at zoom 13+.
- **Offline-first** — bundled GeoJSON coastline renders when network is killed; TTS uses browser voices (no API keys).
- **Judge-proofing** — 12 vulnerability fixes covering grid precision, offline maps, DTN, trust scores, PKI badges, legal disclaimers, coverage planner, and configurable radio range.

---

## Known Constraints

- **In-memory only** — state resets on page refresh.
- **Simulated mesh** — no real LoRa hardware; proves the concept visually.
- **Tiles need internet on first load** — CartoDB CDN; pre-load before going offline. Vector coastline fills in when tiles are hidden.
- **Fishing Zones** toggle is a Phase 2 placeholder (INCOIS PFZ data).
- **TTS quality** depends on OS/browser — pick a "Natural" or "Google" voice from the demo dropdown for best results.

---

## License

Prototype for demonstration purposes.

*SagarGrid — a free offline addressing + safety mesh for India's unserved fishing boats.*
