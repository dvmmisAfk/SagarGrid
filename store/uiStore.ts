import { create } from 'zustand';
import { CellInfo } from '@/types';
import type { AdoptionLevel } from '@/lib/coverageData';

export type WeatherMode = 'realtime' | 'simulate';

interface UIStore {
  networkOnline: boolean;
  showBorderZone: boolean;
  showHazardMap: boolean;
  showWeatherOverlay: boolean;
  weatherMode: WeatherMode;
  showFishingZones: boolean;
  showCoverageMap: boolean;
  coverageLevel: AdoptionLevel;
  demoMode: boolean;
  demoStep: number;
  narrationEnabled: boolean;
  autoPlay: boolean;
  narrationNonce: number;
  selectedCell: CellInfo | null;
  showSOSPanel: boolean;
  showHazardModal: boolean;
  hazardModalCell: string | null;
  activeAlert: { type: 'border' | 'hazard' | 'weather'; message: string } | null;
  visibleCellCount: number;
  gridResolution: number;

  setNetworkOnline: (val: boolean) => void;
  setShowBorderZone: (val: boolean) => void;
  setShowHazardMap: (val: boolean) => void;
  setShowWeatherOverlay: (val: boolean) => void;
  setWeatherMode: (mode: WeatherMode) => void;
  setShowFishingZones: (val: boolean) => void;
  setShowCoverageMap: (val: boolean) => void;
  setCoverageLevel: (level: AdoptionLevel) => void;
  setDemoMode: (val: boolean) => void;
  setDemoStep: (step: number) => void;
  setNarrationEnabled: (val: boolean) => void;
  setAutoPlay: (val: boolean) => void;
  replayNarration: () => void;
  setSelectedCell: (cell: CellInfo | null) => void;
  setShowSOSPanel: (val: boolean) => void;
  setShowHazardModal: (val: boolean, cellIndex?: string) => void;
  setActiveAlert: (alert: UIStore['activeAlert']) => void;
  setVisibleCellCount: (count: number) => void;
  setGridResolution: (res: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  networkOnline: true,
  showBorderZone: false,
  showHazardMap: true,
  showWeatherOverlay: false,
  weatherMode: 'simulate',
  showFishingZones: false,
  showCoverageMap: false,
  coverageLevel: '5%',
  demoMode: false,
  demoStep: 0,
  narrationEnabled: true,
  autoPlay: false,
  narrationNonce: 0,
  selectedCell: null,
  showSOSPanel: false,
  showHazardModal: false,
  hazardModalCell: null,
  activeAlert: null,
  visibleCellCount: 0,
  gridResolution: 6,

  setNetworkOnline: (val) => set({ networkOnline: val }),
  setShowBorderZone: (val) => set({ showBorderZone: val }),
  setShowHazardMap: (val) => set({ showHazardMap: val }),
  setShowWeatherOverlay: (val) => set({ showWeatherOverlay: val }),
  setWeatherMode: (mode) => set({ weatherMode: mode }),
  setShowFishingZones: (val) => set({ showFishingZones: val }),
  setShowCoverageMap: (val) => set({ showCoverageMap: val }),
  setCoverageLevel: (level) => set({ coverageLevel: level }),
  setDemoMode: (val) => set({ demoMode: val }),
  setDemoStep: (step) => set({ demoStep: step }),
  setNarrationEnabled: (val) => set({ narrationEnabled: val }),
  setAutoPlay: (val) => set({ autoPlay: val }),
  replayNarration: () => set((s) => ({ narrationNonce: s.narrationNonce + 1 })),
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setShowSOSPanel: (val) => set({ showSOSPanel: val }),
  setShowHazardModal: (val, cellIndex) =>
    set({ showHazardModal: val, hazardModalCell: cellIndex ?? null }),
  setActiveAlert: (alert) => set({ activeAlert: alert }),
  setVisibleCellCount: (count) => set({ visibleCellCount: count }),
  setGridResolution: (res) => set({ gridResolution: res }),
}));
