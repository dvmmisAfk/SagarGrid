import { create } from 'zustand';
import { Hazard, HazardType } from '@/types';
import { INITIAL_HAZARDS } from '@/lib/hazardData';
import { cellToLatLng } from '@/lib/h3utils';

interface GridStore {
  hazards: Hazard[];
  addHazard: (cellIndex: string, type: HazardType, reportedBy: string, description?: string) => void;
  confirmHazard: (id: string) => void;
  disputeHazard: (id: string) => void;
}

// AI trust score (0–100): a deterministic stand-in for the ML credibility
// model. Weighs community confirmations most heavily, decays with age, and
// penalises disputes — so a fresh single report scores low while a heavily
// confirmed long-standing hazard scores high.
export function computeTrustScore(hazard: Hazard): number {
  const ageHours = (Date.now() - new Date(hazard.reportedAt).getTime()) / 3600000;
  const recencyScore = Math.max(0, 1 - ageHours / 72); // decays over 72h
  const confirmationScore = Math.min(1, hazard.confirmations / 10);
  const disputePenalty = hazard.disputes * 0.15;
  const raw = recencyScore * 0.3 + confirmationScore * 0.7 - disputePenalty;
  return Math.round(Math.max(0, Math.min(1, raw)) * 100);
}

export function trustColor(score: number): string {
  return score > 70 ? '#FF9500' : score > 40 ? '#FFD60A' : '#8A94A6';
}

export function trustLabel(score: number): string {
  return score > 70 ? 'High confidence' : score > 40 ? 'Moderate' : 'Unverified';
}

export const useGridStore = create<GridStore>((set) => ({
  hazards: INITIAL_HAZARDS,

  addHazard: (cellIndex, type, reportedBy, description) =>
    set((state) => {
      const [lat, lng] = cellToLatLng(cellIndex);
      const hazard: Hazard = {
        id: `H${Date.now()}`,
        cellIndex,
        type,
        reportedBy,
        reportedAt: new Date(),
        confirmations: 1,
        disputes: 0,
        description,
        lat,
        lng,
      };
      return { hazards: [...state.hazards, hazard] };
    }),

  confirmHazard: (id) =>
    set((state) => ({
      hazards: state.hazards.map((h) =>
        h.id === id ? { ...h, confirmations: h.confirmations + 1 } : h
      ),
    })),

  disputeHazard: (id) =>
    set((state) => ({
      hazards: state.hazards.map((h) =>
        h.id === id ? { ...h, disputes: h.disputes + 1 } : h
      ),
    })),
}));
