'use client';

import { Marker, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useBoatStore } from '@/store/boatStore';
import { h3IndexToShortCode } from '@/lib/h3utils';

function createBoatIcon(status: string, hasNetwork: boolean) {
  const color =
    status === 'sos_origin'
      ? '#FF3B30'
      : status === 'sos_relay_active'
        ? '#FFD60A'
        : status === 'sos_relay_done'
          ? '#30D158'
          : status === 'border_alert'
            ? '#FF9500'
            : status === 'hazard_alert'
              ? '#FF9500'
              : hasNetwork
                ? '#00D4FF'
                : '#FFFFFF';
  const size = hasNetwork ? 16 : 12;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px;
      background:${color};
      border-radius:50%;
      border:2px solid rgba(255,255,255,0.85);
      box-shadow:0 0 ${status === 'sos_origin' ? '14' : '7'}px ${color};
      ${status === 'sos_origin' || status === 'border_alert' ? 'animation:pulse 0.8s infinite;' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function BoatLayer() {
  const boats = useBoatStore((s) => s.boats);
  const radioRangeKm = useBoatStore((s) => s.radioRangeKm);

  // Draw mesh links
  const meshLinks: [number, number][][] = [];
  const drawnPairs = new Set<string>();
  boats.forEach((boat) => {
    boat.connectedTo.forEach((otherId) => {
      const pairKey = [boat.id, otherId].sort().join('-');
      if (!drawnPairs.has(pairKey)) {
        drawnPairs.add(pairKey);
        const other = boats.find((b) => b.id === otherId);
        if (other) {
          meshLinks.push([
            [boat.lat, boat.lng],
            [other.lat, other.lng],
          ]);
        }
      }
    });
  });

  return (
    <>
      {boats.map((boat) => (
        <Circle
          key={`range-${boat.id}`}
          center={[boat.lat, boat.lng]}
          radius={radioRangeKm * 1000}
          pathOptions={{
            color: '#00D4FF',
            weight: 0.6,
            opacity: 0.25,
            fillOpacity: 0.02,
            dashArray: '3,6',
          }}
        />
      ))}
      {meshLinks.map((positions, i) => (
        <Polyline
          key={`mesh-${i}`}
          positions={positions}
          pathOptions={{ color: '#00D4FF', weight: 1, opacity: 0.4, dashArray: '5,8' }}
        />
      ))}
      {boats.map((boat) => (
        <Marker
          key={boat.id}
          position={[boat.lat, boat.lng]}
          icon={createBoatIcon(boat.status, boat.hasNetwork)}
        >
          <Tooltip
            permanent
            direction="top"
            offset={[0, -8]}
            className={`boat-label${boat.status === 'sos_origin' ? ' boat-sos' : ''}`}
          >
            {boat.name} · {h3IndexToShortCode(boat.currentCell)}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
