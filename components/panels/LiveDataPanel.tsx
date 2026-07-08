'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { useUIStore } from '@/store/uiStore';

export default function LiveDataPanel() {
  const weatherMode = useUIStore((s) => s.weatherMode);
  const { conditions, isLoading, dataSource, lastFetched, fetchWeather } = useWeatherStore();

  if (weatherMode !== 'realtime') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="w-52"
      >
        <div className="glass rounded-2xl p-3 shadow-panel opacity-80">
          <div className="data-label mb-1">Sea State</div>
          <div className="font-mono text-[10px] text-white/40 leading-relaxed">
            Simulated IMD cyclone mode active.
            <br />
            Switch to <span className="text-alert-yellow">Real Time</span> in the Weather toggle for
            live Open-Meteo data.
          </div>
        </div>
      </motion.div>
    );
  }

  const maxWave =
    conditions.length > 0 ? Math.max(...conditions.map((c) => c.waveHeight)) : null;

  const overallStatus = maxWave
    ? maxWave >= 4.0
      ? 'DANGER'
      : maxWave >= 2.5
        ? 'WARNING'
        : maxWave >= 1.5
          ? 'CAUTION'
          : 'SAFE'
    : 'LOADING';

  const statusColor = {
    DANGER: '#FF3B30',
    WARNING: '#FF9500',
    CAUTION: '#FFD60A',
    SAFE: '#30D158',
    LOADING: '#ffffff40',
  }[overallStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="w-52"
    >
      <div className="glass-cyan rounded-2xl p-3 shadow-panel-cyan">
        <div className="flex items-center justify-between mb-2">
          <div className="data-label">Live Sea State</div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                dataSource === 'live' ? 'bg-alert-green animate-pulse' : 'bg-white/30'
              }`}
            />
            <span className="font-mono text-[9px] text-white/30">
              {dataSource === 'live' ? 'Open-Meteo Live' : dataSource === 'cached' ? 'Cached' : 'Fallback'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="font-mono text-lg font-bold" style={{ color: statusColor }}>
            {overallStatus}
          </div>
          {maxWave !== null && (
            <div className="font-mono text-xs text-white/50">max {maxWave.toFixed(1)}m</div>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-3">
          {conditions.slice(0, 4).map((c, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="font-mono text-[9px] text-white/40 truncate pr-2">
                {['Zone A', 'Zone B', 'Zone C', 'Zone D'][i]}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1 rounded-full bg-white/10">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${Math.min(100, (c.waveHeight / 5) * 100)}%`,
                      background:
                        c.status === 'danger'
                          ? '#FF3B30'
                          : c.status === 'warning'
                            ? '#FF9500'
                            : c.status === 'caution'
                              ? '#FFD60A'
                              : '#30D158',
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/60 w-8 text-right">
                  {c.waveHeight.toFixed(1)}m
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/5">
          <div className="font-mono text-[9px] text-white/20 leading-relaxed">
            Source: Open-Meteo Marine API
            <br />
            30+ global wave models · ECMWF + DWD
            <br />
            Updated every 6 hours
          </div>
          {lastFetched && (
            <div className="font-mono text-[9px] text-white/20 mt-1">
              Fetched:{' '}
              {lastFetched.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </div>
          )}
        </div>

        <button
          onClick={() => fetchWeather(true)}
          disabled={isLoading}
          className="mt-2 w-full text-[9px] font-mono text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
        >
          {isLoading ? 'Fetching live data...' : '↺ Refresh weather data'}
        </button>
      </div>
    </motion.div>
  );
}
