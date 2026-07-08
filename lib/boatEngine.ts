import { Boat } from '@/types';

// Starting positions off Tamil Nadu / Bay of Bengal
export const INITIAL_BOATS: Boat[] = [
  {
    id: 'B1',
    name: 'Arjun',
    vernacularName: 'கடல்வேலன்',
    lat: 10.42,
    lng: 80.31,
    currentCell: '',
    status: 'normal',
    connectedTo: [],
    hasNetwork: false,
    route: [
      [10.42, 80.31],
      [10.38, 80.28],
      [10.35, 80.25],
      [10.38, 80.28],
      [10.42, 80.31],
    ],
    routeIndex: 0,
    speed: 0.8,
  },
  {
    id: 'B2',
    name: 'Suresh',
    vernacularName: 'சுரேஷ்',
    lat: 10.45,
    lng: 80.18,
    currentCell: '',
    status: 'normal',
    connectedTo: [],
    hasNetwork: false,
    route: [
      [10.45, 80.18],
      [10.48, 80.15],
      [10.5, 80.12],
      [10.48, 80.15],
      [10.45, 80.18],
    ],
    routeIndex: 0,
    speed: 0.6,
  },
  {
    id: 'B3',
    name: 'Murugan',
    vernacularName: 'முருகன்',
    lat: 10.5,
    lng: 80.06,
    currentCell: '',
    status: 'normal',
    connectedTo: [],
    hasNetwork: false,
    route: [
      [10.5, 80.06],
      [10.52, 80.03],
      [10.54, 80.0],
      [10.52, 80.03],
      [10.5, 80.06],
    ],
    routeIndex: 0,
    speed: 0.7,
  },
  {
    id: 'B4',
    name: 'Rajan',
    vernacularName: 'ராஜன்',
    lat: 10.54,
    lng: 79.95,
    currentCell: '',
    status: 'normal',
    connectedTo: [],
    hasNetwork: false,
    route: [
      [10.54, 79.95],
      [10.56, 79.92],
      [10.58, 79.9],
      [10.56, 79.92],
      [10.54, 79.95],
    ],
    routeIndex: 0,
    speed: 0.5,
  },
  {
    id: 'B5',
    name: 'Shore Station',
    vernacularName: 'கரையோர நிலையம்',
    lat: 10.6,
    lng: 79.82,
    currentCell: '',
    status: 'normal',
    connectedTo: [],
    hasNetwork: true, // This is the only network-connected node
    route: [[10.6, 79.82]], // Shore station is stationary
    routeIndex: 0,
    speed: 0,
  },
];

// RADIO_RANGE_KM: maximum distance for boat-to-boat mesh link
export const RADIO_RANGE_KM = 18;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getConnectedBoats(boatId: string, allBoats: Boat[]): string[] {
  const boat = allBoats.find((b) => b.id === boatId);
  if (!boat) return [];
  return allBoats
    .filter((b) => b.id !== boatId)
    .filter((b) => haversineKm(boat.lat, boat.lng, b.lat, b.lng) <= RADIO_RANGE_KM)
    .map((b) => b.id);
}

export function getBoatSpeedMultiplier(waveHeight: number): number {
  if (waveHeight >= 4.0) return 0;
  if (waveHeight >= 2.5) return 0.3;
  if (waveHeight >= 1.5) return 0.6;
  return 1.0;
}

export function shouldTriggerWeatherSOS(waveHeight: number, boatStatus: string): boolean {
  return waveHeight >= 4.0 && boatStatus === 'normal';
}

export function getStormEscapeHeading(boatLat: number, boatLng: number): [number, number] {
  const shoreLat = 10.78;
  const shoreLng = 79.85;
  const dLat = shoreLat - boatLat;
  const dLng = shoreLng - boatLng;
  const dist = Math.sqrt(dLat ** 2 + dLng ** 2);
  if (dist < 0.0001) return [boatLat, boatLng];
  const stepSize = 0.005;
  return [boatLat + (dLat / dist) * stepSize, boatLng + (dLng / dist) * stepSize];
}
