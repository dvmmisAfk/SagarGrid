'use client';

import { useEffect, useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import * as h3lib from 'h3-js';
import { useUIStore } from '@/store/uiStore';
import { useWeatherStore } from '@/store/weatherStore';
import {
  WEATHER_BOUNDS,
  interpolateWaveHeight,
  waveHeightToCellStatus,
} from '@/lib/realTimeWeather';
import { getCellsInBoundingBox, getCellBoundaryLatLngs } from '@/lib/h3utils';

const MAX_CELLS = 400;

export default function WeatherLayer() {
  const showWeatherOverlay = useUIStore((s) => s.showWeatherOverlay);
  const { conditions, fetchWeather, isLoading } = useWeatherStore();

  useEffect(() => {
    if (showWeatherOverlay && conditions.length === 0) {
      fetchWeather();
    }
  }, [showWeatherOverlay, conditions.length, fetchWeather]);

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

  if (!showWeatherOverlay) return null;

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
