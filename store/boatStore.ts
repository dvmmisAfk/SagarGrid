import { create } from 'zustand';
import { Boat } from '@/types';
import {
  INITIAL_BOATS,
  RADIO_RANGE_KM,
  haversineKm,
  getBoatSpeedMultiplier,
  shouldTriggerWeatherSOS,
  getStormEscapeHeading,
} from '@/lib/boatEngine';
import { latLngToCell } from '@/lib/h3utils';
import { interpolateWaveHeight } from '@/lib/realTimeWeather';
import { useWeatherStore } from '@/store/weatherStore';
import { useSOSStore } from '@/store/sosStore';
import { useUIStore } from '@/store/uiStore';

interface BoatStore {
  boats: Boat[];
  frozen: boolean;
  radioRangeKm: number;
  aisDataLive: boolean;
  weatherAlertsTriggered: Set<string>;
  initBoats: () => void;
  updateBoatPositions: () => void;
  setBoatStatus: (boatId: string, status: Boat['status']) => void;
  setBoatPosition: (boatId: string, lat: number, lng: number) => void;
  applyRealVessels: (vessels: { id: string; lat: number; lng: number; isReal: boolean }[]) => void;
  updateMeshLinks: () => void;
  setFrozen: (val: boolean) => void;
  setRadioRange: (km: number) => void;
}

export const useBoatStore = create<BoatStore>((set, get) => ({
  boats: [],
  frozen: false,
  radioRangeKm: RADIO_RANGE_KM,
  aisDataLive: false,
  weatherAlertsTriggered: new Set(),

  initBoats: () => {
    const initialized = INITIAL_BOATS.map((boat) => ({
      ...boat,
      currentCell: latLngToCell(boat.lat, boat.lng),
    }));
    set({ boats: initialized, weatherAlertsTriggered: new Set() });
    get().updateMeshLinks();
  },

  updateBoatPositions: () => {
    if (get().frozen) return;

    const weatherConditions = useWeatherStore.getState().conditions;
    const sosStatus = useSOSStore.getState().sosEvent.status;
    const triggered = new Set(get().weatherAlertsTriggered);

    set((state) => ({
      boats: state.boats.map((boat) => {
        if (boat.route.length <= 1) return boat;

        const waveHeight = interpolateWaveHeight(boat.lat, boat.lng, weatherConditions);
        const speedMult = getBoatSpeedMultiplier(waveHeight);

        if (
          shouldTriggerWeatherSOS(waveHeight, boat.status) &&
          boat.id !== 'B5' &&
          sosStatus === 'idle' &&
          !triggered.has(boat.id)
        ) {
          triggered.add(boat.id);
          useUIStore.getState().setActiveAlert({
            type: 'weather',
            message: `${boat.name} auto-distress: ${waveHeight.toFixed(1)}m waves detected (Force 8+). Heading to shore.`,
          });
        }

        if (waveHeight >= 3.0 && boat.id !== 'B5') {
          const [newLat, newLng] = getStormEscapeHeading(boat.lat, boat.lng);
          return {
            ...boat,
            lat: newLat,
            lng: newLng,
            status:
              waveHeight >= 4.0 && triggered.has(boat.id)
                ? 'sos_origin'
                : waveHeight >= 3.0
                  ? 'border_alert'
                  : boat.status,
            currentCell: latLngToCell(newLat, newLng),
          };
        }

        if (speedMult === 0) return boat;

        const nextIndex = (boat.routeIndex + 1) % boat.route.length;
        const [nextLat, nextLng] = boat.route[nextIndex];
        const stepSize = 0.0008 * speedMult;
        const dLat = nextLat - boat.lat;
        const dLng = nextLng - boat.lng;
        const dist = Math.sqrt(dLat ** 2 + dLng ** 2);
        let newLat = boat.lat;
        let newLng = boat.lng;
        let newRouteIndex = boat.routeIndex;

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
      weatherAlertsTriggered: triggered,
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

  applyRealVessels: (vessels) => {
    const boatIds = ['B1', 'B2', 'B3', 'B4', 'B5'];
    const hasReal = vessels.some((v) => v.isReal);
    if (!hasReal) return;

    set((state) => ({
      aisDataLive: true,
      boats: state.boats.map((boat, i) => {
        const vessel = vessels.find((v) => v.id === boatIds[i]);
        if (!vessel || boat.id === 'B5') return boat;
        return {
          ...boat,
          lat: vessel.lat,
          lng: vessel.lng,
          currentCell: latLngToCell(vessel.lat, vessel.lng),
          isReal: true,
        };
      }),
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
