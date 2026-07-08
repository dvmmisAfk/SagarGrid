import * as h3 from 'h3-js';

// H3 resolution level — 6 gives cells ~36 km², good for fishing area demo
export const H3_RESOLUTION = 6;

// Custom alphabet for short codes — excludes confusing chars: I, O, 0, 1
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function h3IndexToShortCode(h3Index: string): string {
  if (!h3Index) return 'SG-?????';
  // Hash the full index: for res-6, the trailing hex digits are padding ('f'),
  // so the distinguishing bits live in the leading/middle of the string.
  let hash = 0;
  for (let i = 0; i < h3Index.length; i++) {
    hash = (hash * 31 + h3Index.charCodeAt(i)) >>> 0;
  }
  let code = '';
  let n = hash;
  for (let i = 0; i < 5; i++) {
    code = ALPHABET[n % 32] + code;
    n = Math.floor(n / 32);
  }
  return `SG-${code}`;
}

export function latLngToCell(lat: number, lng: number, resolution = H3_RESOLUTION): string {
  return h3.latLngToCell(lat, lng, resolution);
}

export function cellToLatLng(h3Index: string): [number, number] {
  return h3.cellToLatLng(h3Index) as [number, number];
}

export function getCellBoundaryLatLngs(h3Index: string): [number, number][] {
  return h3.cellToBoundary(h3Index) as [number, number][];
}

export function getNeighborCells(h3Index: string, rings: number): string[] {
  return h3.gridDisk(h3Index, rings);
}

export function areCellsNeighbors(cell1: string, cell2: string, maxRings = 2): boolean {
  return h3.gridDisk(cell1, maxRings).includes(cell2);
}

// All H3 cells whose centers fall inside a bounding box — seamless tessellation.
export function getCellsInBoundingBox(
  northLat: number,
  southLat: number,
  eastLng: number,
  westLng: number,
  resolution: number
): string[] {
  const boundaryPolygon: [number, number][] = [
    [northLat, westLng],
    [northLat, eastLng],
    [southLat, eastLng],
    [southLat, westLng],
    [northLat, westLng],
  ];
  try {
    return h3.polygonToCells(boundaryPolygon, resolution);
  } catch {
    return [];
  }
}

export function getResolutionForZoom(zoom: number): number {
  if (zoom >= 13) return 8;
  if (zoom >= 11) return 7;
  if (zoom >= 9) return 6;
  if (zoom >= 7) return 5;
  return 4;
}

/** True when two indices are the same cell or parent/child at different resolutions. */
export function cellsMatch(cellA: string, cellB: string): boolean {
  if (cellA === cellB) return true;
  try {
    const resA = h3.getResolution(cellA);
    const resB = h3.getResolution(cellB);
    const minRes = Math.min(resA, resB);
    return h3.cellToParent(cellA, minRes) === h3.cellToParent(cellB, minRes);
  } catch {
    return false;
  }
}

export function cellInSet(cellIndex: string, refs: Set<string>): boolean {
  if (refs.has(cellIndex)) return true;
  for (const ref of Array.from(refs)) {
    if (cellsMatch(cellIndex, ref)) return true;
  }
  return false;
}

export function cellInList(cellIndex: string, list: string[]): boolean {
  for (const ref of list) {
    if (cellsMatch(cellIndex, ref)) return true;
  }
  return false;
}

// Legacy helper — now backed by polygon fill for consistent tessellation.
export function cellsInRegion(lat: number, lng: number, radiusKm: number): string[] {
  const radiusDeg = radiusKm / 111;
  return getCellsInBoundingBox(
    lat + radiusDeg,
    lat - radiusDeg,
    lng + radiusDeg,
    lng - radiusDeg,
    H3_RESOLUTION
  );
}

// ── Adaptive resolution ─────────────────────────────────────────────
// Resolution 6 (~36 km²) is fine for open ocean. Near an international
// maritime boundary a 36 km² cell is far too coarse to catch a crossing,
// so we drop to resolution 8 (~0.74 km²) — 49× more precise. Ports use
// resolution 9 (~0.1 km²) for berth-level tracking.
export const H3_RESOLUTION_OCEAN = 6; // ~36 km² — general addressing
export const H3_RESOLUTION_BORDER = 8; // ~0.74 km² — high-precision geofence
export const H3_RESOLUTION_HARBOR = 9; // ~0.1 km² — port-level tracking

// Within this radius of the IMBL, switch to high-resolution cells.
export const BORDER_HIGH_RES_KM = 60;

// Approximate IMBL midpoints (Palk Strait) for proximity checks.
export const IMBL_REFERENCE_POINTS: [number, number][] = [
  [9.85, 80.1],
  [9.9, 80.0],
  [9.92, 79.9],
  [9.95, 79.85],
  [10.0, 79.75],
];

// Key harbors for port-level high resolution zones.
export const HARBOR_POINTS: [number, number][] = [
  [10.78, 79.85], // Nagapattinam
  [11.01, 79.85], // Karaikal
  [9.92, 78.12], // Tuticorin
];

export function h3HaversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getAdaptiveResolution(lat: number, lng: number): number {
  for (const [hLat, hLng] of HARBOR_POINTS) {
    if (h3HaversineKm(lat, lng, hLat, hLng) < 5) return H3_RESOLUTION_HARBOR;
  }
  for (const [bLat, bLng] of IMBL_REFERENCE_POINTS) {
    if (h3HaversineKm(lat, lng, bLat, bLng) < BORDER_HIGH_RES_KM) return H3_RESOLUTION_BORDER;
  }
  return H3_RESOLUTION_OCEAN;
}

export function latLngToCellAdaptive(lat: number, lng: number): string {
  return h3.latLngToCell(lat, lng, getAdaptiveResolution(lat, lng));
}

export function getCellResolution(h3Index: string): number {
  try {
    return h3.getResolution(h3Index);
  } catch {
    return H3_RESOLUTION_OCEAN;
  }
}

export function getResolutionLabel(resolution: number): string {
  switch (resolution) {
    case 6:
      return 'Ocean · ~36 km²';
    case 7:
      return 'Coastal · ~5 km²';
    case 8:
      return 'Border Zone · ~0.74 km²';
    case 9:
      return 'Harbor · ~0.1 km²';
    default:
      return `Res ${resolution}`;
  }
}

// Convert a res-6 cell into its finer res-8 children (49 cells).
export function cellToBorderChildren(h3Index: string): string[] {
  try {
    return h3.cellToChildren(h3Index, H3_RESOLUTION_BORDER);
  } catch {
    return [];
  }
}
