'use client';

import { useUIStore } from '@/store/uiStore';
import { useWeatherStore } from '@/store/weatherStore';
import { coveragePercent, AdoptionLevel } from '@/lib/coverageData';

type ToggleKey =
  | 'showBorderZone'
  | 'showHazardMap'
  | 'showWeatherOverlay'
  | 'showFishingZones'
  | 'showCoverageMap';

const TOGGLES: {
  key: ToggleKey;
  emoji: string;
  label: string;
  subtext: string;
  activeColor: string;
}[] = [
  { key: 'showBorderZone', emoji: '🚧', label: 'Border Zone', subtext: 'IMBL · Adaptive H3', activeColor: '#FF3B30' },
  { key: 'showHazardMap', emoji: '⚓', label: 'Hazard Map', subtext: 'Crowd Reports', activeColor: '#FF9500' },
  { key: 'showWeatherOverlay', emoji: '🌀', label: 'Weather', subtext: 'Simulate or Real Time', activeColor: '#FFD60A' },
  { key: 'showFishingZones', emoji: '🎣', label: 'Fish Zones', subtext: 'INCOIS PFZ', activeColor: '#30D158' },
  { key: 'showCoverageMap', emoji: '📡', label: 'Coverage Map', subtext: 'Deployment Planner', activeColor: '#30D158' },
];

const ADOPTION_LEVELS: AdoptionLevel[] = ['5%', '20%', '50%'];

export default function FeatureToggles() {
  const store = useUIStore();
  const { dataSource, fetchWeather, isLoading } = useWeatherStore();

  const setterFor = (key: ToggleKey): ((val: boolean) => void) => {
    switch (key) {
      case 'showBorderZone':
        return store.setShowBorderZone;
      case 'showHazardMap':
        return store.setShowHazardMap;
      case 'showWeatherOverlay':
        return store.setShowWeatherOverlay;
      case 'showFishingZones':
        return store.setShowFishingZones;
      case 'showCoverageMap':
        return store.setShowCoverageMap;
    }
  };

  const handleWeatherMode = (mode: 'realtime' | 'simulate') => {
    store.setWeatherMode(mode);
    if (mode === 'realtime') fetchWeather(true);
  };

  return (
    <div data-tour="toggles" className="glass rounded-2xl p-3 shadow-panel flex flex-col gap-1.5 w-56">
      {TOGGLES.map(({ key, emoji, label, subtext, activeColor }) => {
        const isActive = store[key];
        const setter = setterFor(key);

        return (
          <div key={key}>
            <button
              data-tour={`toggle-${key}`}
              onClick={() => setter(!isActive)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
              style={{
                background: isActive ? `${activeColor}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? `${activeColor}35` : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-base flex-shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-xs font-medium text-white truncate">{label}</div>
                <div className="font-mono text-[9px] text-white/30 truncate">
                  {key === 'showCoverageMap' && isActive
                    ? `${store.coverageLevel} adoption · ${coveragePercent(store.coverageLevel)}% covered`
                    : key === 'showWeatherOverlay' && isActive
                      ? store.weatherMode === 'realtime'
                        ? dataSource === 'live'
                          ? 'Real Time · Open-Meteo Live'
                          : isLoading
                            ? 'Real Time · Loading…'
                            : 'Real Time · Cached/fallback'
                        : 'Simulate · IMD cyclone demo'
                      : subtext}
                </div>
              </div>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${isActive ? '' : 'opacity-20'}`}
                style={{
                  background: isActive ? activeColor : '#fff',
                  boxShadow: isActive ? `0 0 6px ${activeColor}` : 'none',
                }}
              />
            </button>

            {key === 'showWeatherOverlay' && isActive && (
              <div className="px-1 pt-1.5 flex flex-col gap-1.5">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleWeatherMode('realtime')}
                    className="flex-1 py-1.5 rounded-lg font-mono text-[9px] font-semibold transition-all"
                    style={{
                      background:
                        store.weatherMode === 'realtime'
                          ? 'rgba(48,209,88,0.18)'
                          : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${
                        store.weatherMode === 'realtime'
                          ? 'rgba(48,209,88,0.45)'
                          : 'rgba(255,255,255,0.08)'
                      }`,
                      color:
                        store.weatherMode === 'realtime' ? '#30D158' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    Real Time
                  </button>
                  <button
                    onClick={() => handleWeatherMode('simulate')}
                    className="flex-1 py-1.5 rounded-lg font-mono text-[9px] font-semibold transition-all"
                    style={{
                      background:
                        store.weatherMode === 'simulate'
                          ? 'rgba(255,214,10,0.18)'
                          : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${
                        store.weatherMode === 'simulate'
                          ? 'rgba(255,214,10,0.45)'
                          : 'rgba(255,255,255,0.08)'
                      }`,
                      color:
                        store.weatherMode === 'simulate' ? '#FFD60A' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    Simulate
                  </button>
                </div>
                {store.weatherMode === 'realtime' && (
                  <button
                    onClick={() => fetchWeather()}
                    disabled={isLoading}
                    className="font-mono text-[9px] text-white/40 hover:text-white/60 transition-colors text-left px-2 disabled:opacity-40"
                  >
                    {isLoading ? '↻ Fetching live data…' : '↻ Refresh Open-Meteo data'}
                  </button>
                )}
              </div>
            )}

            {key === 'showCoverageMap' && isActive && (
              <div className="flex gap-1 px-1 pt-1.5">
                {ADOPTION_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => store.setCoverageLevel(level)}
                    className="flex-1 py-1 rounded-lg font-mono text-[9px] transition-all"
                    style={{
                      background:
                        store.coverageLevel === level ? 'rgba(48,209,88,0.18)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${store.coverageLevel === level ? 'rgba(48,209,88,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: store.coverageLevel === level ? '#30D158' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
