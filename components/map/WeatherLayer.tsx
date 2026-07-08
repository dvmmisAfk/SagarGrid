'use client';

import { Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useUIStore } from '@/store/uiStore';
import { CYCLONE_CENTER } from '@/lib/weatherData';

const eyeIcon = L.divIcon({
  className: '',
  html: `<div style="
    font-size:22px; line-height:28px; width:28px; height:28px; text-align:center;
    animation:spin 4s linear infinite;
  ">🌀</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function WeatherLayer() {
  const showWeatherOverlay = useUIStore((s) => s.showWeatherOverlay);
  if (!showWeatherOverlay) return null;

  const center: [number, number] = [CYCLONE_CENTER.lat, CYCLONE_CENTER.lng];

  return (
    <>
      <Circle
        center={center}
        radius={220000}
        pathOptions={{ color: '#FFD60A', weight: 0.5, fillColor: '#FFD60A', fillOpacity: 0.08 }}
        interactive={false}
      />
      <Circle
        center={center}
        radius={120000}
        pathOptions={{ color: '#FF9500', weight: 0.8, fillColor: '#FF9500', fillOpacity: 0.12 }}
        interactive={false}
      />
      <Circle
        center={center}
        radius={50000}
        pathOptions={{ color: '#FF3B30', weight: 1, fillColor: '#FF3B30', fillOpacity: 0.18 }}
        interactive={false}
      />
      <Marker position={center} icon={eyeIcon} interactive={false} />
    </>
  );
}
