import { create } from 'zustand';
import { Boat } from '@/types';
import { INITIAL_BOATS, RADIO_RANGE_KM, haversineKm } from '@/lib/boatEngine';
import { latLngToCell } from '@/lib/h3utils';

interface BoatStore {
  boats: Boat[];
  frozen: boolean;
  radioRangeKm: number;
  initBoats: () => void;
  updateBoatPositions: () => void;
  setBoatStatus: (boatId: string, status: Boat['status']) => void;
  setBoatPosition: (boatId: string, lat: number, lng: number) => void;
  updateMeshLinks: () => void;
  setFrozen: (val: boolean) => void;
  setRadioRange: (km: number) => void;
}

export const useBoatStore = create<BoatStore>((set, get) => ({
  boats: [],
  frozen: false,
  radioRangeKm: RADIO_RANGE_KM,

  initBoats: () => {
    const initialized = INITIAL_BOATS.map((boat) => ({
      ...boat,
      currentCell: latLngToCell(boat.lat, boat.lng),
    }));
    set({ boats: initialized });
    get().updateMeshLinks();
  },

  updateBoatPositions: () => {
    if (get().frozen) return;
    set((state) => ({
      boats: state.boats.map((boat) => {
        if (boat.route.length <= 1) return boat;
        const nextIndex = (boat.routeIndex + 1) % boat.route.length;
        const [nextLat, nextLng] = boat.route[nextIndex];
        const stepSize = 0.0008; // Small step per tick
        const dLat = nextLat - boat.lat;
        const dLng = nextLng - boat.lng;
        const dist = Math.sqrt(dLat ** 2 + dLng ** 2);
        let newLat = boat.lat,
          newLng = boat.lng,
          newRouteIndex = boat.routeIndex;
        if (dist < stepSize) {
          newLat = nextLat;
          newLng = nextLng;
          newRouteIndex = nextIndex;
        } else {
          newLat = boat.lat + (dLat / dist) * stepSize;
          newLng = boat.lng + (dLng / dist) * stepSize;
        }
        return {
          ...boat,
          lat: newLat,
          lng: newLng,
          routeIndex: newRouteIndex,
          currentCell: latLngToCell(newLat, newLng),
        };
      }),
    }));
    get().updateMeshLinks();
  },

  setBoatStatus: (boatId, status) => {
    set((state) => ({
      boats: state.boats.map((b) => (b.id === boatId ? { ...b, status } : b)),
    }));
  },

  setBoatPosition: (boatId, lat, lng) => {
    set((state) => ({
      boats: state.boats.map((b) =>
        b.id === boatId ? { ...b, lat, lng, currentCell: latLngToCell(lat, lng) } : b
      ),
    }));
    get().updateMeshLinks();
  },

  updateMeshLinks: () => {
    const { boats, radioRangeKm } = get();
    set({
      boats: boats.map((boat) => ({
        ...boat,
        connectedTo: boats
          .filter((b) => b.id !== boat.id)
          .filter((b) => haversineKm(boat.lat, boat.lng, b.lat, b.lng) <= radioRangeKm)
          .map((b) => b.id),
      })),
    });
  },

  setFrozen: (val) => set({ frozen: val }),

  setRadioRange: (km) => {
    set({ radioRangeKm: km });
    get().updateMeshLinks();
  },
}));
