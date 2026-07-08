export type CellStatus =
  | 'normal'
  | 'land'
  | 'border'
  | 'hazard'
  | 'weather_watch'
  | 'weather_danger'
  | 'fishing_zone';

export type BoatStatus =
  | 'normal'
  | 'sos_origin'
  | 'sos_relay_active'
  | 'sos_relay_done'
  | 'border_alert'
  | 'hazard_alert';

export type HazardType = 'reef' | 'ghost_net' | 'wreck' | 'rough_current' | 'other';

export type SOSStatus = 'idle' | 'relaying' | 'reached_shore' | 'timeout';

export interface Boat {
  id: string;
  name: string;
  vernacularName?: string;
  lat: number;
  lng: number;
  currentCell: string; // H3 index
  status: BoatStatus;
  connectedTo: string[]; // IDs of boats in range
  hasNetwork: boolean;
  route: [number, number][]; // [lat, lng] waypoints
  routeIndex: number;
  speed: number; // knots
}

export interface Hazard {
  id: string;
  cellIndex: string;
  type: HazardType;
  reportedBy: string;
  reportedAt: Date;
  confirmations: number;
  disputes: number;
  description?: string;
  lat: number;
  lng: number;
}

export interface SOSHop {
  boatId: string;
  boatName: string;
  cellCode: string;
  receivedAtMs: number; // ms offset from SOS start
  lat: number;
  lng: number;
  status: 'waiting' | 'receiving' | 'relaying' | 'done';
}

export interface SOSEvent {
  id: string;
  originBoatId: string;
  originCell: string;
  originLat: number;
  originLng: number;
  hops: SOSHop[];
  status: SOSStatus;
  startedAt: Date | null;
}

export interface CellInfo {
  h3Index: string;
  shortCode: string;
  status: CellStatus;
  lat: number;
  lng: number;
  hazards: Hazard[];
  boatsInCell: string[];
}
