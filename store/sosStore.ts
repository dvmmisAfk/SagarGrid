import { create } from 'zustand';
import { SOSEvent, SOSHop } from '@/types';

interface SOSStore {
  sosEvent: SOSEvent;
  initSOS: (
    originBoatId: string,
    originCell: string,
    originLat: number,
    originLng: number,
    hops: SOSHop[]
  ) => void;
  advanceHop: (hopIndex: number, newStatus: SOSHop['status']) => void;
  completeSOS: () => void;
  resetSOS: () => void;
}

const defaultSOS: SOSEvent = {
  id: '',
  originBoatId: '',
  originCell: '',
  originLat: 0,
  originLng: 0,
  hops: [],
  status: 'idle',
  startedAt: null,
};

export const useSOSStore = create<SOSStore>((set) => ({
  sosEvent: defaultSOS,

  initSOS: (originBoatId, originCell, originLat, originLng, hops) =>
    set({
      sosEvent: {
        id: Date.now().toString(),
        originBoatId,
        originCell,
        originLat,
        originLng,
        hops,
        status: 'relaying',
        startedAt: new Date(),
      },
    }),

  advanceHop: (hopIndex, newStatus) =>
    set((state) => ({
      sosEvent: {
        ...state.sosEvent,
        hops: state.sosEvent.hops.map((h, i) =>
          i === hopIndex ? { ...h, status: newStatus } : h
        ),
      },
    })),

  completeSOS: () =>
    set((state) => ({
      sosEvent: { ...state.sosEvent, status: 'reached_shore' },
    })),

  resetSOS: () => set({ sosEvent: defaultSOS }),
}));
