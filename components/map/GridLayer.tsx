'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMap, Polygon, Tooltip } from 'react-leaflet';
import * as h3lib from 'h3-js';
import { useUIStore } from '@/store/uiStore';
import { useGridStore } from '@/store/gridStore';
import { useBoatStore } from '@/store/boatStore';
import { isBorderCell } from '@/lib/borderData';
import { isLandCell } from '@/lib/landSea';
import { interpolateWaveHeight, waveHeightToCellStatus } from '@/lib/realTimeWeather';
import { useWeatherStore } from '@/store/weatherStore';
import {
  getCellsInBoundingBox,
  getResolutionForZoom,
  getCellBoundaryLatLngs,
  h3IndexToShortCode,
  cellInList,
  cellsMatch,
} from '@/lib/h3utils';

const MAX_CELLS = 600;

export default function GridLayer() {
  const map = useMap();
  const [cells, setCells] = useState<string[]>([]);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [zoom, setZoom] = useState(9);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    showBorderZone,
    showHazardMap,
    showWeatherOverlay,
    setSelectedCell,
    setVisibleCellCount,
    setGridResolution,
  } = useUIStore();
  const { hazards } = useGridStore();
  const { boats } = useBoatStore();
  const { conditions } = useWeatherStore();

  const hazardCellList = useMemo(() => hazards.map((h) => h.cellIndex), [hazards]);
  const boatCells = useMemo(
    () => boats.map((b) => b.currentCell).filter(Boolean),
    [boats]
  );

  const updateGrid = useCallback(() => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    let resolution = getResolutionForZoom(zoom);

    const pad = 0.3;
    const N = bounds.getNorth() + pad;
    const S = bounds.getSouth() - pad;
    const E = bounds.getEast() + pad;
    const W = bounds.getWest() - pad;

    let allCells = getCellsInBoundingBox(N, S, E, W, resolution);

    if (allCells.length > MAX_CELLS && resolution > 4) {
      resolution = Math.max(4, resolution - 1);
      allCells = getCellsInBoundingBox(N, S, E, W, resolution);
    }

    setCells(allCells.slice(0, MAX_CELLS));
    setZoom(map.getZoom());
    const oceanCount = allCells.filter((idx) => {
      const [lat, lng] = h3lib.cellToLatLng(idx);
      return !isLandCell(lat, lng);
    }).length;
    setVisibleCellCount(oceanCount);
    setGridResolution(resolution);
  }, [map, setVisibleCellCount, setGridResolution]);

  useEffect(() => {
    updateGrid();
    const debounced = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(updateGrid, 120);
    };
    map.on('moveend', debounced);
    map.on('zoomend', debounced);
    return () => {
      map.off('moveend', debounced);
      map.off('zoomend', debounced);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [map, updateGrid]);

  useEffect(() => {
    updateGrid();
  }, [showBorderZone, showHazardMap, showWeatherOverlay, updateGrid]);

  return (
    <>
      {cells.map((cellIndex) => {
        const boundary = getCellBoundaryLatLngs(cellIndex);
        const [lat, lng] = h3lib.cellToLatLng(cellIndex);
        const isLand = isLandCell(lat, lng);
        const shortCode = isLand ? 'LAND' : h3IndexToShortCode(cellIndex);
        const isHov = hoveredCell === cellIndex;

        const isBorder = !isLand && showBorderZone && isBorderCell(cellIndex);
        const isHazard = !isLand && showHazardMap && cellInList(cellIndex, hazardCellList);
        const waveHeight =
          !isLand && conditions.length > 0
            ? interpolateWaveHeight(lat, lng, conditions)
            : 0;
        const weatherStatus =
          !isLand && showWeatherOverlay && conditions.length > 0
            ? waveHeightToCellStatus(waveHeight)
            : 'normal';
        const hasBoat = !isLand && boatCells.some((bc) => cellsMatch(cellIndex, bc));

        let fill = '#1E4D7B';
        let fillOp = 0.07;
        let stroke = '#2a6090';
        let strokeOp = 0.3;
        let strokeW = 0.5;

        if (isLand) {
          fill = '#1a2433';
          fillOp = 0.45;
          stroke = '#3d4f63';
          strokeOp = 0.55;
          strokeW = 0.6;
        } else if (hasBoat) {
          fill = '#00E5FF';
          fillOp = 0.14;
          stroke = '#00E5FF';
          strokeOp = 0.7;
          strokeW = 1.2;
        } else if (isHazard) {
          fill = '#FF9500';
          fillOp = 0.25;
          stroke = '#FF9500';
          strokeOp = 0.8;
          strokeW = 1.2;
        } else if (isBorder) {
          fill = '#FF3B30';
          fillOp = 0.3;
          stroke = '#FF3B30';
          strokeOp = 0.9;
          strokeW = 1.5;
        }
        // Weather cell coloring handled by WeatherLayer overlay

        if (isHov && !isLand) {
          fillOp = Math.min(fillOp + 0.18, 0.55);
          strokeOp = 1;
          strokeW += 0.5;
        }
        if (isHov && isLand) {
          fillOp = Math.min(fillOp + 0.12, 0.6);
          strokeOp = 0.85;
        }

        return (
          <Polygon
            key={cellIndex}
            positions={boundary}
            pathOptions={{
              color: stroke,
              weight: strokeW,
              opacity: strokeOp,
              fillColor: fill,
              fillOpacity: fillOp,
            }}
            eventHandlers={{
              mouseover: () => setHoveredCell(cellIndex),
              mouseout: () => setHoveredCell(null),
              click: () => {
                if (isLand) {
                  setSelectedCell({
                    h3Index: cellIndex,
                    shortCode: 'LAND',
                    status: 'land',
                    lat,
                    lng,
                    hazards: [],
                    boatsInCell: [],
                  });
                  return;
                }
                setSelectedCell({
                  h3Index: cellIndex,
                  shortCode: h3IndexToShortCode(cellIndex),
                  status: isBorder
                    ? 'border'
                    : isHazard
                      ? 'hazard'
                      : weatherStatus !== 'normal'
                        ? weatherStatus
                        : 'normal',
                  lat,
                  lng,
                  hazards: hazards.filter((h) => cellsMatch(cellIndex, h.cellIndex)),
                  boatsInCell: boats
                    .filter((b) => cellsMatch(cellIndex, b.currentCell))
                    .map((b) => b.id),
                });
              },
              contextmenu: (e) => {
                if (isLand) return;
                e.originalEvent?.preventDefault?.();
                useUIStore.getState().setShowHazardModal(true, cellIndex);
              },
            }}
          >
            {(isHov || (isLand && zoom >= 10)) && (
              <Tooltip
                sticky={false}
                permanent={isLand && zoom >= 10}
                direction="center"
                className={isLand ? 'land-cell-tooltip' : 'cell-tooltip'}
              >
                {shortCode}
              </Tooltip>
            )}
          </Polygon>
        );
      })}
    </>
  );
}
