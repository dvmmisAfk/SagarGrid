import { create } from 'zustand';
import { MarineConditions } from '@/lib/realTimeWeather';

interface WeatherStore {
  conditions: MarineConditions[];
  lastFetched: Date | null;
  isLoading: boolean;
  error: string | null;
  dataSource: 'live' | 'cached' | 'fallback';
  fetchWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  conditions: [],
  lastFetched: null,
  isLoading: false,
  error: null,
  dataSource: 'fallback',

  fetchWeather: async () => {
    const { lastFetched } = get();
    if (lastFetched && Date.now() - lastFetched.getTime() < 30 * 60 * 1000) {
      set({ dataSource: 'cached' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();
      const conditions: MarineConditions[] = data.conditions ?? [];

      set({
        conditions,
        lastFetched: new Date(),
        isLoading: false,
        dataSource: conditions.length > 0 ? 'live' : 'fallback',
        error: null,
      });
    } catch {
      set({
        isLoading: false,
        error: 'Live weather unavailable — showing last known conditions',
        dataSource: get().conditions.length > 0 ? 'cached' : 'fallback',
      });
    }
  },
}));
