'use client';

import { Polygon } from 'react-leaflet';
import { useUIStore } from '@/store/uiStore';
import { BORDER_CELLS } from '@/lib/borderData';
import { getCellBoundaryLatLngs } from '@/lib/h3utils';

const BORDER_CELL_LIST = Array.from(BORDER_CELLS);

export default function BorderZoneLayer() {
  const showBorderZone = useUIStore((s) => s.showBorderZone);
  if (!showBorderZone) return null;

  return (
    <>
      {BORDER_CELL_LIST.map((cell) => (
        <Polygon
          key={`border-${cell}`}
          positions={getCellBoundaryLatLngs(cell)}
          pathOptions={{
            color: '#FF3B30',
            weight: 1.2,
            fillColor: '#FF3B30',
            fillOpacity: 0.4,
          }}
          interactive={false}
        />
      ))}
    </>
  );
}
