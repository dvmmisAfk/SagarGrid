import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PanelId =
  | 'live-data'
  | 'fleet'
  | 'dtn'
  | 'cell-info'
  | 'controls'
  | 'sos-panel'
  | 'demo-controller'
  | 'alert-banner';

export interface PanelPosition {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getDefaultPanelPositions(): Record<PanelId, PanelPosition> {
  if (typeof window === 'undefined') {
    return {
      'live-data': { x: 16, y: 72 },
      fleet: { x: 16, y: 240 },
      dtn: { x: 16, y: 480 },
      'cell-info': { x: 1200, y: 72 },
      controls: { x: 1200, y: 520 },
      'sos-panel': { x: 400, y: 120 },
      'demo-controller': { x: 360, y: 680 },
      'alert-banner': { x: 420, y: 560 },
    };
  }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const pad = 16;
  const top = 60;

  return {
    'live-data': { x: pad, y: top },
    fleet: { x: pad, y: top + 180 },
    dtn: { x: pad, y: clamp(h - 320, top + 360, h - 200) },
    'cell-info': { x: clamp(w - 304, pad, w - 304), y: top },
    controls: { x: clamp(w - 240, pad, w - 240), y: clamp(h - 420, top, h - 200) },
    'sos-panel': { x: clamp((w - 520) / 2, pad, w - 520 - pad), y: top + 40 },
    'demo-controller': {
      x: clamp((w - 560) / 2, pad, w - 560 - pad),
      y: clamp(h - 200, top, h - 160),
    },
    'alert-banner': {
      x: clamp((w - 480) / 2, pad, w - 480 - pad),
      y: clamp(h - 300, top, h - 240),
    },
  };
}

interface PanelLayoutStore {
  positions: Partial<Record<PanelId, PanelPosition>>;
  zOrder: Partial<Record<PanelId, number>>;
  topZ: number;
  initDefaults: () => void;
  setPosition: (id: PanelId, pos: PanelPosition) => void;
  bringToFront: (id: PanelId) => number;
  resetLayout: () => void;
}

export const usePanelLayoutStore = create<PanelLayoutStore>()(
  persist(
    (set, get) => ({
      positions: {},
      zOrder: {},
      topZ: 1100,

      initDefaults: () => {
        const defaults = getDefaultPanelPositions();
        set((state) => ({
          positions: { ...defaults, ...state.positions },
        }));
      },

      setPosition: (id, pos) => {
        if (typeof window === 'undefined') return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        set((state) => ({
          positions: {
            ...state.positions,
            [id]: {
              x: clamp(pos.x, 0, w - 80),
              y: clamp(pos.y, 56, h - 80),
            },
          },
        }));
      },

      bringToFront: (id) => {
        const next = get().topZ + 1;
        set((state) => ({
          topZ: next,
          zOrder: { ...state.zOrder, [id]: next },
        }));
        return next;
      },

      resetLayout: () => {
        set({ positions: getDefaultPanelPositions(), zOrder: {}, topZ: 1100 });
      },
    }),
    {
      name: 'sagargrid-panel-layout',
      partialize: (state) => ({ positions: state.positions }),
    }
  )
);
