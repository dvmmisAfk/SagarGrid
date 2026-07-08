import { NextResponse } from 'next/server';
import { fetchMarineConditions } from '@/lib/realTimeWeather';

export async function GET() {
  const tokenConfigured = Boolean(process.env.GFW_API_TOKEN);
  let weatherOk = false;
  let sampleWave: number | null = null;
  let vesselSource: 'live' | 'fallback' | 'unconfigured' = 'unconfigured';
  let vesselCount = 0;

  try {
    const conditions = await fetchMarineConditions();
    weatherOk = conditions.length > 0;
    sampleWave = conditions.length > 0 ? conditions[0].waveHeight : null;
  } catch {
    weatherOk = false;
  }

  if (!tokenConfigured) {
    vesselSource = 'unconfigured';
  } else {
    try {
      const startDate = new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const url =
        `https://gateway.api.globalfishingwatch.org/v3/events` +
        `?datasets[0]=public-global-fishing-events:latest` +
        `&start-date=${startDate}` +
        `&end-date=${endDate}` +
        `&latitude-min=9.0&latitude-max=12.0` +
        `&longitude-min=79.0&longitude-max=82.0` +
        `&limit=5` +
        `&types[0]=FISHING`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.GFW_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        vesselCount = data.entries?.length ?? 0;
        vesselSource = vesselCount > 0 ? 'live' : 'fallback';
      } else {
        vesselSource = 'fallback';
      }
    } catch {
      vesselSource = 'fallback';
    }
  }

  return NextResponse.json({
    weather: { ok: weatherOk, sampleWave, provider: 'Open-Meteo Marine' },
    vessels: {
      source: vesselSource,
      count: vesselCount,
      tokenConfigured,
      provider: 'Global Fishing Watch',
    },
    checkedAt: new Date().toISOString(),
  });
}
