// Bundled vector geography for the Bay of Bengal / Palk Strait region so the
// map still shows land vs water with ZERO internet (raster tiles unavailable).
// Coordinates are [lng, lat] (GeoJSON order).
//
// The eastern + southern coastline is traced accurately (Chennai → Point
// Calimere → Palk Bay → Kanyakumari) so the fishing grounds and the Palk
// Strait stay OPEN WATER — boats must never sit on the landmass fill.

// Coastal points, north → south, following the real shoreline.
const EAST_SOUTH_COAST: [number, number][] = [
  [80.27, 13.1], // Chennai
  [80.19, 12.62], // Mahabalipuram
  [79.86, 11.93], // Puducherry
  [79.77, 11.75], // Cuddalore
  [79.85, 11.39], // Parangipettai
  [79.84, 10.77], // Nagapattinam
  [79.86, 10.36], // Vedaranyam
  [79.86, 10.28], // Point Calimere (SE tip — coast turns west here)
  [79.52, 10.05], // Palk Bay
  [79.31, 9.55],
  [79.3, 9.28], // Rameswaram / Pamban
  [79.12, 9.28], // Mandapam
  [78.55, 9.0],
  [78.13, 8.76], // Thoothukudi (Tuticorin)
  [78.02, 8.38],
  [77.55, 8.08], // Kanyakumari
];

// Crude inland/western boundary to close the landmass (no boats operate here).
const WEST_INLAND: [number, number][] = [
  [77.0, 8.4],
  [76.85, 9.5],
  [76.9, 10.8],
  [77.3, 12.0],
  [78.2, 13.0],
  [79.2, 13.5],
];

export const COAST_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Tamil Nadu Coast' },
      geometry: { type: 'LineString', coordinates: EAST_SOUTH_COAST },
    },
  ],
} as const;

export const LAND_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Indian Landmass' },
      geometry: {
        type: 'Polygon',
        coordinates: [[...EAST_SOUTH_COAST, ...WEST_INLAND, EAST_SOUTH_COAST[0]]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Sri Lanka' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.12, 9.82],
            [80.55, 9.6],
            [81.2, 8.55],
            [81.9, 7.2],
            [81.65, 6.2],
            [80.65, 5.95],
            [79.85, 6.05],
            [79.65, 6.85],
            [79.85, 7.75],
            [80.12, 8.8],
            [80.12, 9.82],
          ],
        ],
      },
    },
  ],
} as const;
