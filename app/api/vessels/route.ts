import { NextResponse } from 'next/server';

const FALLBACK_VESSELS = [
  { id: 'B1', name: 'Arjun', lat: 10.42, lng: 80.31, flag: 'IND', type: 'fishing' },
  { id: 'B2', name: 'Suresh', lat: 10.45, lng: 80.18, flag: 'IND', type: 'fishing' },
  { id: 'B3', name: 'Murugan', lat: 10.5, lng: 80.06, flag: 'IND', type: 'fishing' },
  { id: 'B4', name: 'Rajan', lat: 10.54, lng: 79.95, flag: 'IND', type: 'fishing' },
];

export async function GET() {
  const token = process.env.GFW_API_TOKEN;
  if (!token) {
    return NextResponse.json({ entries: FALLBACK_VESSELS, source: 'fallback', tokenConfigured: false });
  }

  const startDate = new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const url =
    `https://gateway.api.globalfishingwatch.org/v3/events` +
    `?datasets[0]=public-global-fishing-events:latest` +
    `&start-date=${startDate}` +
    `&end-date=${endDate}` +
    `&latitude-min=9.0&latitude-max=12.0` +
    `&longitude-min=79.0&longitude-max=82.0` +
    `&limit=20` +
    `&types[0]=FISHING`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('GFW API error:', response.status, body);
      throw new Error(`GFW API error: ${response.status}`);
    }
    const data = await response.json();
    const entries = data.entries ?? [];
    if (entries.length === 0) {
      return NextResponse.json({ entries: FALLBACK_VESSELS, source: 'fallback', reason: 'no_events', tokenConfigured: true });
    }
    return NextResponse.json({ ...data, source: 'live', tokenConfigured: true });
  } catch {
    return NextResponse.json({ entries: FALLBACK_VESSELS, source: 'fallback', tokenConfigured: true });
  }
}
