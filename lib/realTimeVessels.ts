export interface RealVessel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  flag?: string;
  vesselType?: string;
  lastSeen?: string;
  isReal: boolean;
}

const FALLBACK_VESSELS: RealVessel[] = [
  { id: 'B1', name: 'Arjun', lat: 10.42, lng: 80.31, flag: 'IND', vesselType: 'fishing', isReal: false },
  { id: 'B2', name: 'Suresh', lat: 10.45, lng: 80.18, flag: 'IND', vesselType: 'fishing', isReal: false },
  { id: 'B3', name: 'Murugan', lat: 10.5, lng: 80.06, flag: 'IND', vesselType: 'fishing', isReal: false },
  { id: 'B4', name: 'Rajan', lat: 10.54, lng: 79.95, flag: 'IND', vesselType: 'fishing', isReal: false },
  { id: 'B5', name: 'Shore Station', lat: 10.6, lng: 79.82, flag: 'IND', vesselType: 'shore', isReal: false },
];

function parseGFWEvent(event: Record<string, unknown>, index: number): RealVessel {
  const vessel = (event.vessel ?? {}) as Record<string, unknown>;
  const position = (event.position ?? event.geojson ?? {}) as Record<string, unknown>;
  const coords = (position.coordinates ?? []) as number[];

  return {
    id: `real-${index}`,
    name: (vessel.name as string) ?? `Vessel ${index + 1}`,
    lat: (position.lat as number) ?? coords[1] ?? 10.42,
    lng: (position.lon as number) ?? (position.lng as number) ?? coords[0] ?? 80.31,
    flag: (vessel.flag as string) ?? 'IND',
    vesselType: (vessel.type as string) ?? 'fishing',
    lastSeen: (event.start as string) ?? new Date().toISOString(),
    isReal: true,
  };
}

export async function fetchRealVessels(): Promise<RealVessel[]> {
  try {
    const response = await fetch('/api/vessels?lat=10.5&lng=80.1');
    if (!response.ok) return FALLBACK_VESSELS;

    const data = await response.json();
    const entries = data.entries ?? data.data ?? [];

    if (data.source === 'fallback' || !Array.isArray(entries) || entries.length === 0) {
      return FALLBACK_VESSELS;
    }

    const vessels = entries.slice(0, 5).map((event: Record<string, unknown>, i: number) =>
      parseGFWEvent(event, i)
    );

    return vessels.some((v) => v.isReal) ? vessels : FALLBACK_VESSELS;
  } catch {
    return FALLBACK_VESSELS;
  }
}

export function getFallbackVessels(): RealVessel[] {
  return FALLBACK_VESSELS;
}
