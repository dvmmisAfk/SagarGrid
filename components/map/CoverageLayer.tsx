'use client';

import { useMemo } from 'react';
import { Polygon } from 'react-leaflet';
import { getCoverageByAdoption } from '@/lib/coverageData';
import { getCellBoundaryLatLngs } from '@/lib/h3utils';
import { useUIStore } from '@/store/uiStore';

export default function CoverageLayer() {
  const showCoverageMap = useUIStore((s) => s.showCoverageMap);
  const coverageLevel = useUIStore((s) => s.coverageLevel);

  const { covered, shadow } = useMemo(
    () => getCoverageByAdoption(coverageLevel),
    [coverageLevel]
  );

  if (!showCoverageMap) return null;

  return (
    <>
      {shadow.map((cell) => (
        <Polygon
          key={`shd-${cell}`}
          positions={getCellBoundaryLatLngs(cell)}
          pathOptions={{
            color: '#FF3B30',
            fillColor: '#FF3B30',
            fillOpacity: 0.15,
            weight: 0.4,
            opacity: 0.3,
          }}
          interactive={false}
        />
      ))}
      {covered.map((cell) => (
        <Polygon
          key={`cov-${cell}`}
          positions={getCellBoundaryLatLngs(cell)}
          pathOptions={{
            color: '#30D158',
            fillColor: '#30D158',
            fillOpacity: 0.22,
            weight: 0.4,
            opacity: 0.4,
          }}
          interactive={false}
        />
      ))}
    </>
  );
}
