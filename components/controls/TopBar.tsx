'use client';

import { useUIStore } from '@/store/uiStore';
import { useBoatStore } from '@/store/boatStore';
import { useGridStore } from '@/store/gridStore';
import { useWeatherStore } from '@/store/weatherStore';

export default function TopBar() {
  const { networkOnline, setNetworkOnline, demoMode, setDemoMode, setDemoStep, visibleCellCount, gridResolution } =
    useUIStore();
  const { boats, aisDataLive } = useBoatStore();
  const { hazards } = useGridStore();
  const { conditions, dataSource } = useWeatherStore();

  const meshBoats = boats.filter((b) => b.connectedTo.length > 0).length;
  const maxWave =
    conditions.length > 0 ? Math.max(...conditions.map((c) => c.waveHeight)) : null;

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[1001] h-14 flex items-center px-5 gap-5"
      style={{
        background:
          'linear-gradient(to bottom, rgba(5,13,26,0.98) 0%, rgba(5,13,26,0.85) 100%)',
      }}
    >
      {/* ── Logo mark ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <svg width="28" height="28" viewBox="0 0 80 80" className="flex-shrink-0">
          <polygon
            points="40,4 72,22 72,58 40,76 8,58 8,22"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="3"
            opacity="0.5"
          />
          <polygon
            points="40,4 72,22 72,58 40,76 8,58 8,22"
            fill="rgba(0,229,255,0.08)"
            stroke="#00E5FF"
            strokeWidth="1.5"
          />
          <text
            x="40"
            y="46"
            textAnchor="middle"
            fontFamily="Space Grotesk, sans-serif"
            fontWeight="700"
            fontSize="20"
            fill="#00E5FF"
            letterSpacing="2"
          >
            SG
          </text>
        </svg>
        <div>
          <div className="font-display font-bold text-white text-base leading-none tracking-tight">
            SagarGrid
          </div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-signal-cyan opacity-50 mt-0.5">
            An address for every wave
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="w-px h-7 bg-white opacity-10" />

      {/* ── Live stats bar ── */}
      <div className="flex items-center gap-5 flex-1">
        <StatChip label="Boats in mesh" value={`${meshBoats}`} unit={`/ ${boats.length}`} color="cyan" />
        <StatChip
          label="Max wave height"
          value={maxWave !== null ? `${maxWave.toFixed(1)}m` : '...'}
          unit={dataSource === 'live' ? 'LIVE' : dataSource === 'cached' ? 'CACHED' : ''}
          color={
            maxWave === null
              ? 'cyan'
              : maxWave >= 4
                ? 'red'
                : maxWave >= 2.5
                  ? 'orange'
                  : 'green'
          }
        />
        <StatChip
          label="Vessel data"
          value={aisDataLive ? 'AIS LIVE' : 'DEMO'}
          color={aisDataLive ? 'green' : 'cyan'}
        />
        <StatChip label="Hazards reported" value={`${hazards.length}`} color="orange" />
        <StatChip
          label="Grid cells"
          value={`${visibleCellCount}`}
          unit={`H3-${gridResolution}`}
          color="cyan"
        />
        <StatChip
          label="Network"
          value={networkOnline ? 'ONLINE' : 'OFFLINE'}
          color={networkOnline ? 'green' : 'red'}
          pulse={!networkOnline}
        />
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          data-tour="network-toggle"
          onClick={() => setNetworkOnline(!networkOnline)}
          className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs font-medium transition-all duration-300 ${
            networkOnline
              ? 'border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
              : 'border border-alert-red/60 text-alert-red'
          }`}
          style={!networkOnline ? { boxShadow: '0 0 12px rgba(255,59,48,0.3)' } : {}}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              networkOnline ? 'bg-alert-green' : 'bg-alert-red animate-pulse'
            }`}
          />
          {networkOnline ? 'Kill Network' : 'Restore Network'}
        </button>

        <button
          onClick={() => {
            setDemoMode(!demoMode);
            if (!demoMode) setDemoStep(0);
          }}
          className={`px-4 py-1.5 rounded-full font-display font-semibold text-xs transition-all duration-200 ${
            demoMode
              ? 'bg-signal-cyan text-ocean-900 shadow-glow-cyan'
              : 'border border-signal-cyan/30 text-signal-cyan hover:border-signal-cyan/60 hover:bg-signal-cyan/10'
          }`}
        >
          {demoMode ? '✕ Exit Demo' : '▶ Demo Mode'}
        </button>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  unit,
  color,
  pulse,
}: {
  label: string;
  value: string;
  unit?: string;
  color: 'cyan' | 'orange' | 'green' | 'red';
  pulse?: boolean;
}) {
  const colorMap = {
    cyan: 'text-signal-cyan',
    orange: 'text-alert-orange',
    green: 'text-alert-green',
    red: 'text-alert-red',
  };
  return (
    <div className="hidden md:flex flex-col gap-0.5">
      <div className="data-label">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-mono text-sm font-semibold ${colorMap[color]} ${pulse ? 'animate-pulse' : ''}`}
        >
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-white/30">{unit}</span>}
      </div>
    </div>
  );
}
