import { NextResponse } from 'next/server';
import { fetchMarineConditions } from '@/lib/realTimeWeather';

export const revalidate = 1800;

export async function GET() {
  const conditions = await fetchMarineConditions();
  return NextResponse.json({ conditions, fetchedAt: new Date().toISOString() });
}
