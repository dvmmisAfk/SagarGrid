'use client';

import { useBoatStore } from '@/store/boatStore';
import { h3IndexToShortCode } from '@/lib/h3utils';
import { BoatStatus } from '@/types';

const STATUS_CONFIG: Record<BoatStatus, { dot: string; label: string; glow: string }> = {
  normal: { dot: '#00E5FF', label: 'Active', glow: 'rgba(0,229,255,0.4)' },
  sos_origin: { dot: '#FF3B30', label: 'SOS', glow: 'rgba(255,59,48,0.6)' },
  sos_relay_active: { dot: '#FFD60A', label: 'Relaying', glow: 'rgba(255,214,10,0.5)' },
  sos_relay_done: { dot: '#30D158', label: 'Relayed ✓', glow: 'rgba(48,209,88,0.4)' },
  border_alert: { dot: '#FF9500', label: 'Border!', glow: 'rgba(255,149,0,0.5)' },
  hazard_alert: { dot: '#FF9500', label: 'Hazard!', glow: 'rgba(255,149,0,0.5)' },
};

export default function BoatListPanel() {
  const { boats, frozen, setFrozen } = useBoatStore();

  return (
    <div data-tour="fleet" className="glass-cyan rounded-2xl p-4 w-full shadow-panel-cyan">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="data-label">Fleet Status</div>
          <div className="font-display text-white font-semibold text-sm mt-0.5">
            {boats.filter((b) => b.connectedTo.length > 0).length} in mesh
          </div>
        </div>
        <button
          onClick={() => setFrozen(!frozen)}
          className={`text-[10px] font-mono px-2 py-1 rounded-full border transition-colors ${
            frozen
              ? 'border-alert-yellow/50 text-alert-yellow bg-alert-yellow/10'
              : 'border-white/10 text-white/40 hover:border-white/20'
          }`}
        >
          {frozen ? '⏸ Frozen' : '⏵ Live'}
        </button>
      </div>

      {/* Multi-GNSS positioning (V12) */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1 h-1 rounded-full bg-alert-green flex-shrink-0" />
        <span className="font-mono text-[9px] text-white/25">GPS · NavIC · GLONASS — multi-GNSS</span>
      </div>

      {/* Boat list */}
      <div className="flex flex-col gap-2">
        {boats.map((boat) => {
          const cfg = STATUS_CONFIG[boat.status] || STATUS_CONFIG.normal;
          const isShore = boat.id === 'B5';
          return (
            <div
              key={boat.id}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
            >
              {/* Status dot or shore icon */}
              {isShore ? (
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="7" y="1" width="2" height="8" fill="#00E5FF" rx="1" />
                    <rect x="3" y="9" width="10" height="2" fill="#00E5FF" rx="1" />
                    <rect x="5" y="11" width="6" height="2" fill="rgba(0,229,255,0.5)" rx="1" />
                    <circle cx="8" cy="1.5" r="2" fill="#00E5FF" />
                  </svg>
                </div>
              ) : (
                <div className="flex-shrink-0 relative">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.glow}` }}
                  />
                  {boat.status === 'sos_origin' && (
                    <div
                      className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
                      style={{ background: cfg.dot, opacity: 0.5 }}
                    />
                  )}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-white text-xs font-medium truncate">
                    {boat.name}
                  </span>
                  {isShore && (
                    <span className="flex-shrink-0 text-[9px] font-mono text-signal-cyan bg-signal-cyan/10 px-1.5 py-0 rounded-full border border-signal-cyan/20">
                      SHORE
                    </span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-signal-cyan opacity-70 truncate mt-0.5">
                  {boat.currentCell ? h3IndexToShortCode(boat.currentCell) : '...'}
                </div>
              </div>

              {/* Status badge */}
              {boat.status !== 'normal' && (
                <div className="text-[9px] font-mono flex-shrink-0" style={{ color: cfg.dot }}>
                  {cfg.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
