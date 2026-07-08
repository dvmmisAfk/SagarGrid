'use client';

import { useEffect, useMemo } from 'react';
import { Circle, Marker, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import * as h3lib from 'h3-js';
import { useUIStore } from '@/store/uiStore';
import { useWeatherStore } from '@/store/weatherStore';
import { CYCLONE_CENTER, CYCLONE_NAME } from '@/lib/weatherData';
import {
  WEATHER_BOUNDS,
  interpolateWaveHeight,
  waveHeightToCellStatus,
} from '@/lib/realTimeWeather';
import { getCellsInBoundingBox, getCellBoundaryLatLngs } from '@/lib/h3utils';

const MAX_CELLS = 400;

const eyeIcon = L.divIcon({
  className: '',
  html: `<div style="
    font-size:22px; line-height:28px; width:28px; height:28px; text-align:center;
    animation:spin 4s linear infinite;
  ">🌀</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function SimulatedWeatherLayer() {
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
      <Marker position={center} icon={eyeIcon} interactive={false}>
        <Tooltip permanent direction="top" offset={[0, -16]} className="cell-tooltip">
          {CYCLONE_NAME} · Simulated IMD advisory
        </Tooltip>
      </Marker>
    </>
  );
}

function RealtimeWeatherLayer() {
  const { conditions, fetchWeather, isLoading } = useWeatherStore();

  useEffect(() => {
    if (conditions.length === 0) fetchWeather();
  }, [conditions.length, fetchWeather]);

  const areaCells = useMemo(
    () =>
      getCellsInBoundingBox(
        WEATHER_BOUNDS.N,
        WEATHER_BOUNDS.S,
        WEATHER_BOUNDS.E,
        WEATHER_BOUNDS.W,
        6
      ).slice(0, MAX_CELLS),
    []
  );

  const styleMap = {
    weather_danger: { fill: '#FF3B30', opacity: 0.4 },
    weather_watch: { fill: '#FF9500', opacity: 0.28 },
    weather_advisory: { fill: '#FFD60A', opacity: 0.18 },
    normal: { fill: '#1E4D7B', opacity: isLoading ? 0.08 : 0 },
  };

  return (
    <>
      {areaCells.map((cellIndex) => {
        const [cellLat, cellLng] = h3lib.cellToLatLng(cellIndex);
        const waveHeight = interpolateWaveHeight(cellLat, cellLng, conditions);
        const status = waveHeightToCellStatus(waveHeight);

        if (status === 'normal' && !isLoading) return null;

        const boundary = getCellBoundaryLatLngs(cellIndex);
        const style = styleMap[status as keyof typeof styleMap] || styleMap.normal;

        return (
          <Polygon
            key={`weather-${cellIndex}`}
            positions={boundary}
            pathOptions={{
              color: style.fill,
              weight: 0.8,
              opacity: style.opacity * 0.8,
              fillColor: style.fill,
              fillOpacity: style.opacity,
            }}
          >
            <Tooltip sticky className="cell-tooltip">
              {conditions.length > 0
                ? `Wave: ${waveHeight.toFixed(1)}m · ${status.replace('weather_', '').toUpperCase()}`
                : 'Loading live wave data…'}
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}

export default function WeatherLayer() {
  const showWeatherOverlay = useUIStore((s) => s.showWeatherOverlay);
  const weatherMode = useUIStore((s) => s.weatherMode);

  if (!showWeatherOverlay) return null;
  if (weatherMode === 'simulate') return <SimulatedWeatherLayer />;
  return <RealtimeWeatherLayer />;
}
