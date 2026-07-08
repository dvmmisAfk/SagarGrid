import { CellStatus } from '@/types';

export interface MarineConditions {
  lat: number;
  lng: number;
  waveHeight: number;
  waveDirection: number;
  windWaveHeight: number;
  swellHeight: number;
  currentVelocity: number;
  timestamp: string;
  status: 'safe' | 'caution' | 'warning' | 'danger';
  label: string;
}

export const WEATHER_SAMPLE_POINTS: { lat: number; lng: number; label: string }[] = [
  { lat: 10.42, lng: 80.31, label: 'Zone A — Arjun area' },
  { lat: 10.5, lng: 80.06, label: 'Zone B — Mid channel' },
  { lat: 10.54, lng: 79.95, label: 'Zone C — Outer waters' },
  { lat: 10.6, lng: 79.82, label: 'Zone D — Shore proximity' },
  { lat: 9.9, lng: 80.0, label: 'Zone E — Palk Strait' },
  { lat: 10.2, lng: 80.5, label: 'Zone F — East sector' },
  { lat: 10.8, lng: 79.7, label: 'Zone G — North sector' },
  { lat: 9.6, lng: 79.8, label: 'Zone H — South sector' },
];

export const WEATHER_BOUNDS = { N: 12.0, S: 8.5, E: 82.0, W: 78.5 };

function getStatusFromWaveHeight(h: number): MarineConditions['status'] {
  if (h >= 4.0) return 'danger';
  if (h >= 2.5) return 'warning';
  if (h >= 1.5) return 'caution';
  return 'safe';
}

function getLabelFromStatus(status: MarineConditions['status'], waveHeight: number): string {
  const h = waveHeight.toFixed(1);
  switch (status) {
    case 'danger':
      return `Very Rough Sea · ${h}m waves · Do not fish`;
    case 'warning':
      return `Rough Sea · ${h}m waves · Small boats stay ashore`;
    case 'caution':
      return `Moderate Sea · ${h}m waves · Exercise caution`;
    default:
      return `Slight Sea · ${h}m waves · Conditions good`;
  }
}

function fallbackConditions(): MarineConditions[] {
  return WEATHER_SAMPLE_POINTS.map((point) => ({
    lat: point.lat,
    lng: point.lng,
    waveHeight: 0.8,
    waveDirection: 45,
    windWaveHeight: 0.5,
    swellHeight: 0.3,
    currentVelocity: 0.2,
    timestamp: new Date().toISOString(),
    status: 'safe',
    label: 'Slight Sea · 0.8m waves · Conditions good',
  }));
}

async function fetchPointConditions(point: {
  lat: number;
  lng: number;
}): Promise<MarineConditions | null> {
  const url =
    `https://marine-api.open-meteo.com/v1/marine` +
    `?latitude=${point.lat}` +
    `&longitude=${point.lng}` +
    `&current=wave_height,wave_direction,wind_wave_height,swell_wave_height` +
    `&timezone=Asia%2FKolkata`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;

  const data = await response.json();
  const current = data.current;
  const waveHeight = current?.wave_height ?? 1.0;
  const status = getStatusFromWaveHeight(waveHeight);

  return {
    lat: point.lat,
    lng: point.lng,
    waveHeight,
    waveDirection: current?.wave_direction ?? 0,
    windWaveHeight: current?.wind_wave_height ?? 0,
    swellHeight: current?.swell_wave_height ?? 0,
    currentVelocity: 0,
    timestamp: current?.time ?? new Date().toISOString(),
    status,
    label: getLabelFromStatus(status, waveHeight),
  };
}

export async function fetchMarineConditions(): Promise<MarineConditions[]> {
  try {
    const settled = await Promise.allSettled(
      WEATHER_SAMPLE_POINTS.map((point) => fetchPointConditions(point))
    );

    const results = settled
      .map((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          return { ...r.value, label: `${WEATHER_SAMPLE_POINTS[i].label.split(' — ')[0]} · ${r.value.label}` };
        }
        return null;
      })
      .filter((c): c is MarineConditions => c !== null);

    if (results.length === 0) return fallbackConditions();
    return results;
  } catch {
    return fallbackConditions();
  }
}

export function waveHeightToCellStatus(waveHeightMeters: number): CellStatus {
  if (waveHeightMeters >= 4.0) return 'weather_danger';
  if (waveHeightMeters >= 2.5) return 'weather_watch';
  if (waveHeightMeters >= 1.5) return 'weather_advisory';
  return 'normal';
}

export function interpolateWaveHeight(
  lat: number,
  lng: number,
  conditions: MarineConditions[]
): number {
  if (conditions.length === 0) return 0.8;

  let totalWeight = 0;
  let weightedHeight = 0;

  for (const c of conditions) {
    const dist = Math.sqrt((lat - c.lat) ** 2 + (lng - c.lng) ** 2);
    if (dist < 0.001) return c.waveHeight;
    const weight = 1 / dist ** 2;
    totalWeight += weight;
    weightedHeight += weight * c.waveHeight;
  }

  return totalWeight > 0 ? weightedHeight / totalWeight : 0.8;
}
