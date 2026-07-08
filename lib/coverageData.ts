import { latLngToCell, getNeighborCells } from './h3utils';

// Deployment planner: models how mesh coverage grows with adoption. Turns the
// "bootstrap / density" objection into a feature — coverage strengthens as
// more boats join (the network effect).
export type AdoptionLevel = '5%' | '20%' | '50%';

// Candidate fishing-area cells across the Tamil Nadu / Bay of Bengal shelf.
const AREA = { latMin: 9.7, latMax: 11.2, lngMin: 79.5, lngMax: 80.7, step: 0.06 };

function buildCandidateCells(): string[] {
  const set = new Set<string>();
  for (let lat = AREA.latMin; lat <= AREA.latMax; lat += AREA.step) {
    for (let lng = AREA.lngMin; lng <= AREA.lngMax; lng += AREA.step) {
      set.add(latLngToCell(lat, lng));
    }
  }
  return Array.from(set);
}

const CANDIDATE_CELLS = buildCandidateCells();

// Stable hash so coverage is deterministic (no per-frame flicker).
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function getCoverageByAdoption(level: AdoptionLevel): {
  covered: string[];
  shadow: string[];
  nodes: string[];
} {
  const pct = level === '5%' ? 5 : level === '20%' ? 20 : 50;
  const nodes = CANDIDATE_CELLS.filter((c) => hash(c) % 100 < pct);
  const coveredSet = new Set<string>();
  nodes.forEach((n) => getNeighborCells(n, 1).forEach((c) => coveredSet.add(c)));
  const covered = CANDIDATE_CELLS.filter((c) => coveredSet.has(c));
  const shadow = CANDIDATE_CELLS.filter((c) => !coveredSet.has(c));
  return { covered, shadow, nodes };
}

export function coveragePercent(level: AdoptionLevel): number {
  const { covered } = getCoverageByAdoption(level);
  return Math.round((covered.length / CANDIDATE_CELLS.length) * 100);
}
