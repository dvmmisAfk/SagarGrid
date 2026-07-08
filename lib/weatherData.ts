import { cellsInRegion } from './h3utils';

// Simulated cyclone centered in Bay of Bengal
export const CYCLONE_CENTER = { lat: 12.5, lng: 82.5 };
export const CYCLONE_NAME = 'Bay of Bengal Low Pressure System';

export function getWeatherCells(): { danger: string[]; watch: string[]; advisory: string[] } {
  const danger = cellsInRegion(CYCLONE_CENTER.lat, CYCLONE_CENTER.lng, 50);
  const watch = cellsInRegion(CYCLONE_CENTER.lat, CYCLONE_CENTER.lng, 120).filter(
    (c) => !danger.includes(c)
  );
  const advisory = cellsInRegion(CYCLONE_CENTER.lat, CYCLONE_CENTER.lng, 220).filter(
    (c) => !danger.includes(c) && !watch.includes(c)
  );
  return { danger, watch, advisory };
}
