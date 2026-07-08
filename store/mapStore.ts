import { create } from 'zustand';
import type { Map as LeafletMap } from 'leaflet';

interface MapStore {
  map: LeafletMap | null;
  setMap: (map: LeafletMap | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (map) => set({ map }),
}));
