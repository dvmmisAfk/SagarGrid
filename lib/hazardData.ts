import { Hazard } from '@/types';
import { latLngToCell } from './h3utils';

// Three hazards spread along active fishing routes in open water — visible and
// realistic when Hazard Map is toggled on.
export const INITIAL_HAZARDS: Hazard[] = [
  {
    id: 'H1',
    cellIndex: latLngToCell(10.36, 80.24),
    type: 'reef',
    reportedBy: 'Murugan',
    reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    confirmations: 8,
    disputes: 0,
    description: 'Submerged reef — 2 m below surface at low tide, unmarked on charts',
    lat: 10.36,
    lng: 80.24,
  },
  {
    id: 'H2',
    cellIndex: latLngToCell(10.44, 80.14),
    type: 'ghost_net',
    reportedBy: 'Suresh',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    confirmations: 5,
    disputes: 1,
    description: 'Drifting ghost net — tangled a propeller 4 km offshore',
    lat: 10.44,
    lng: 80.14,
  },
  {
    id: 'H3',
    cellIndex: latLngToCell(10.52, 80.02),
    type: 'rough_current',
    reportedBy: 'Rajan',
    reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    confirmations: 4,
    disputes: 0,
    description: 'Strong cross-current after monsoon swell — drift risk near strait',
    lat: 10.52,
    lng: 80.02,
  },
];

export const HAZARD_META: Record<
  Hazard['type'],
  { emoji: string; label: string; color: string }
> = {
  reef: { emoji: '🪸', label: 'Reef / Rock', color: '#FF3B30' },
  ghost_net: { emoji: '🕸️', label: 'Ghost Net', color: '#FF9500' },
  wreck: { emoji: '☠️', label: 'Shipwreck', color: '#B91C1C' },
  rough_current: { emoji: '🌊', label: 'Rough Current', color: '#00D4FF' },
  other: { emoji: '⚠️', label: 'Other', color: '#FFD60A' },
};
