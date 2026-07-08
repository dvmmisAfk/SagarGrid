// Maritime border zone — distance-based geofence along the IMBL in the Palk Strait.
// Ocean-only: never highlights land cells (fixes the red block on Sri Lanka).

export { isBorderH3Index as isBorderCell, isInBorderZone, distanceToIMBLKm, BORDER_BUFFER_KM } from './landSea';

// Kept for any legacy imports — empty; GridLayer uses distance-based detection.
export const BORDER_CELLS: Set<string> = new Set();
