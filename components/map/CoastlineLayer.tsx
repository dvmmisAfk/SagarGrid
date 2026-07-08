'use client';

import { GeoJSON } from 'react-leaflet';
import { COAST_GEOJSON, LAND_GEOJSON } from '@/lib/coastlineData';
import { useUIStore } from '@/store/uiStore';

// Vector geography. The coastline is always drawn (subtle, so it lines up with
// the tiles when online). The filled landmass is only rendered OFFLINE — when
// tiles are hidden — so it never sits under boats during the normal online demo.
export default function CoastlineLayer() {
  const networkOnline = useUIStore((s) => s.networkOnline);

  return (
    <>
      {!networkOnline && (
        <GeoJSON
          key="land-offline"
          data={LAND_GEOJSON as never}
          interactive={false}
          style={() => ({
            color: '#24506e',
            weight: 1,
            opacity: 0.6,
            fillColor: '#0b1b2e',
            fillOpacity: 0.95,
          })}
        />
      )}
      <GeoJSON
        key="coast"
        data={COAST_GEOJSON as never}
        interactive={false}
        style={() => ({
          color: '#2f6588',
          weight: 1.2,
          opacity: networkOnline ? 0.35 : 0.7,
          fill: false,
        })}
      />
    </>
  );
}
