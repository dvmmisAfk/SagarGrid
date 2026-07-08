'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/mapStore';
import { useUIStore } from '@/store/uiStore';
import GridLayer from './GridLayer';
import BoatLayer from './BoatLayer';
import HazardLayer from './HazardLayer';
import WeatherLayer from './WeatherLayer';
import CoverageLayer from './CoverageLayer';
import CoastlineLayer from './CoastlineLayer';
import SOSCanvas from './SOSCanvas';

// Center on Bay of Bengal / Tamil Nadu coast
const MAP_CENTER: [number, number] = [10.5, 80.1];
const MAP_ZOOM = 9;

function MapRegistrar() {
  const map = useMap();
  const setMap = useMapStore((s) => s.setMap);
  useEffect(() => {
    setMap(map);
    return () => setMap(null);
  }, [map, setMap]);
  return null;
}

export default function SagarMap() {
  const networkOnline = useUIStore((s) => s.networkOnline);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="w-full h-full"
      style={{ background: '#0d2137' }}
      zoomControl={false}
      minZoom={7}
      maxZoom={14}
    >
      {/* Raster tiles need the CDN — hidden when offline. */}
      {networkOnline && (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="SagarGrid | Map data © OpenStreetMap contributors, CartoDB"
          maxZoom={14}
        />
      )}
      {/* Bundled vector coastline — always visible, survives offline. */}
      <CoastlineLayer />
      <MapRegistrar />
      <GridLayer />
      <CoverageLayer />
      <HazardLayer />
      <WeatherLayer />
      <BoatLayer />
      <SOSCanvas />
    </MapContainer>
  );
}
