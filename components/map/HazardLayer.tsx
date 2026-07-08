'use client';

import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useUIStore } from '@/store/uiStore';
import { useGridStore } from '@/store/gridStore';
import { HAZARD_META } from '@/lib/hazardData';
import { h3IndexToShortCode } from '@/lib/h3utils';

function createHazardIcon(emoji: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      font-size:16px; line-height:26px; width:26px; height:26px; text-align:center;
      background:rgba(10,22,40,0.85);
      border:1.5px solid rgba(255,149,0,0.8);
      border-radius:50%;
      box-shadow:0 0 8px rgba(255,149,0,0.5);
    ">${emoji}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function HazardLayer() {
  const showHazardMap = useUIStore((s) => s.showHazardMap);
  const setSelectedCell = useUIStore((s) => s.setSelectedCell);
  const hazards = useGridStore((s) => s.hazards);

  if (!showHazardMap) return null;

  return (
    <>
      {hazards.map((hazard) => {
        const meta = HAZARD_META[hazard.type];
        return (
          <Marker
            key={hazard.id}
            position={[hazard.lat, hazard.lng]}
            icon={createHazardIcon(meta.emoji)}
            eventHandlers={{
              click: () => {
                setSelectedCell({
                  h3Index: hazard.cellIndex,
                  shortCode: h3IndexToShortCode(hazard.cellIndex),
                  status: 'hazard',
                  lat: hazard.lat,
                  lng: hazard.lng,
                  hazards: hazards.filter((h) => h.cellIndex === hazard.cellIndex),
                  boatsInCell: [],
                });
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -12]} className="boat-label">
              {meta.label} · {h3IndexToShortCode(hazard.cellIndex)}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
