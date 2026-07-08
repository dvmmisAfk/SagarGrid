// Land vs ocean classification for grid cells. Uses bundled coastline polygons
// so border zones and hazards never bleed onto Sri Lanka / mainland.

import { haversineKm } from './boatEngine';
import { cellToLatLng } from './h3utils';

// India TN landmass — [lng, lat] ring (matches coastlineData.ts).
const INDIA_LAND: [number, number][] = [
  [80.27, 13.1],
  [80.19, 12.62],
  [79.86, 11.93],
  [79.77, 11.75],
  [79.85, 11.39],
  [79.84, 10.77],
  [79.86, 10.36],
  [79.86, 10.28],
  [79.52, 10.05],
  [79.31, 9.55],
  [79.3, 9.28],
  [79.12, 9.28],
  [78.55, 9.0],
  [78.13, 8.76],
  [78.02, 8.38],
  [77.55, 8.08],
  [77.0, 8.4],
  [76.85, 9.5],
  [76.9, 10.8],
  [77.3, 12.0],
  [78.2, 13.0],
  [79.2, 13.5],
];

// Sri Lanka — [lng, lat] ring.
const SRI_LANKA_LAND: [number, number][] = [
  [80.12, 9.82],
  [80.55, 9.6],
  [81.2, 8.55],
  [81.9, 7.2],
  [81.65, 6.2],
  [80.65, 5.95],
  [79.85, 6.05],
  [79.65, 6.85],
  [79.85, 7.75],
  [80.12, 8.8],
];

function pointInRing(lat: number, lng: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isLandCell(lat: number, lng: number): boolean {
  return pointInRing(lat, lng, INDIA_LAND) || pointInRing(lat, lng, SRI_LANKA_LAND);
}

export function isOceanCell(lat: number, lng: number): boolean {
  return !isLandCell(lat, lng);
}

export function isLandH3Index(h3Index: string): boolean {
  const [lat, lng] = cellToLatLng(h3Index);
  return isLandCell(lat, lng);
}

// IMBL midline through the Palk Strait — points placed in open water only.
const IMBL_WATER_LINE: [number, number][] = [
  [10.08, 79.48],
  [9.95, 79.52],
  [9.82, 79.56],
  [9.68, 79.61],
  [9.55, 79.66],
  [9.42, 79.71],
  [9.28, 79.77],
  [9.15, 79.83],
];

/** Shortest distance from a point to the IMBL polyline (km). */
export function distanceToIMBLKm(lat: number, lng: number): number {
  let min = Infinity;
  for (let i = 0; i < IMBL_WATER_LINE.length - 1; i++) {
    const [lat1, lng1] = IMBL_WATER_LINE[i];
    const [lat2, lng2] = IMBL_WATER_LINE[i + 1];
    min = Math.min(min, distToSegmentKm(lat, lng, lat1, lng1, lat2, lng2));
  }
  return min;
}

function distToSegmentKm(
  plat: number,
  plng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const cosLat = Math.cos((plat * Math.PI) / 180);
  const dx = (lng2 - lng1) * cosLat * 111;
  const dy = (lat2 - lat1) * 111;
  const px = (plng - lng1) * cosLat * 111;
  const py = (plat - lat1) * 111;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return haversineKm(plat, plng, lat1, lng1);
  let t = (px * dx + py * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestLat = lat1 + t * (lat2 - lat1);
  const closestLng = lng1 + t * (lng2 - lng1);
  return haversineKm(plat, plng, closestLat, closestLng);
}

/** Buffer width for the maritime border warning zone (km). */
export const BORDER_BUFFER_KM = 12;

export function isInBorderZone(lat: number, lng: number): boolean {
  if (isLandCell(lat, lng)) return false;
  return distanceToIMBLKm(lat, lng) <= BORDER_BUFFER_KM;
}

export function isBorderH3Index(h3Index: string): boolean {
  const [lat, lng] = cellToLatLng(h3Index);
  return isInBorderZone(lat, lng);
}
