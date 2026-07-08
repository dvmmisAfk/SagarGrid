'use client';

import { useUIStore } from '@/store/uiStore';
import { useBoatStore } from '@/store/boatStore';
import { useGridStore, computeTrustScore, trustColor, trustLabel } from '@/store/gridStore';
import { getCellResolution, getResolutionLabel, cellsMatch } from '@/lib/h3utils';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: 'Open Ocean', color: '#00E5FF', bg: 'rgba(0,229,255,0.08)' },
  land: { label: '🏝 Land', color: '#8A94A6', bg: 'rgba(138,148,166,0.12)' },
  border: { label: '⚠ Border Zone', color: '#FF3B30', bg: 'rgba(255,59,48,0.12)' },
  hazard: { label: '⚠ Hazard Reported', color: '#FF9500', bg: 'rgba(255,149,0,0.12)' },
  weather_watch: { label: '🌀 Weather Watch', color: '#FFD60A', bg: 'rgba(255,214,10,0.1)' },
  weather_advisory: { label: '🌀 Weather Advisory', color: '#FFD60A', bg: 'rgba(255,214,10,0.08)' },
  weather_danger: { label: '🌀 Danger Zone', color: '#FF3B30', bg: 'rgba(255,59,48,0.12)' },
  fishing_zone: { label: '🎣 Fishing Zone', color: '#30D158', bg: 'rgba(48,209,88,0.1)' },
};

const HAZARD_ICONS: Record<string, string> = {
  reef: '🔴',
  ghost_net: '🟠',
  wreck: '☠️',
  rough_current: '🌊',
  other: '⚠️',
};

export default function CellInfoPanel() {
  const { selectedCell, setSelectedCell, setShowHazardModal } = useUIStore();
  const { boats } = useBoatStore();
  const { hazards, confirmHazard, disputeHazard } = useGridStore();

  if (!selectedCell) return null;

  const status = STATUS_LABELS[selectedCell.status] || STATUS_LABELS.normal;
  const cellHazards = hazards.filter((h) => cellsMatch(selectedCell.h3Index, h.cellIndex));
  const cellBoats = boats.filter((b) => cellsMatch(selectedCell.h3Index, b.currentCell));
  const isLand = selectedCell.status === 'land';

  return (
    <div className="glass-cyan rounded-2xl shadow-panel-cyan overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto">
          {/* Header */}
          <div className="p-4 pb-3 border-b border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="data-label mb-1">Grid Cell</div>
                <div className="cell-code text-base">{selectedCell.shortCode}</div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-white/30 hover:text-white transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: status.bg,
                  color: status.color,
                  border: `1px solid ${status.color}30`,
                }}
              >
                {status.label}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="p-4 pb-3 border-b border-white/5">
            <div className="data-label mb-2">Position</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                  H3 Index
                </div>
                <div className="font-mono text-[10px] text-white/50 mt-0.5 break-all">
                  {selectedCell.h3Index}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                  Resolution
                </div>
                <div className="font-mono text-xs text-white/60 mt-0.5">
                  {getResolutionLabel(getCellResolution(selectedCell.h3Index))}
                </div>
              </div>
            </div>
          </div>

          {/* Boats in cell */}
          {cellBoats.length > 0 && (
            <div className="p-4 pb-3 border-b border-white/5">
              <div className="data-label mb-2">Boats in Cell ({cellBoats.length})</div>
              <div className="flex flex-col gap-1.5">
                {cellBoats.map((boat) => (
                  <div key={boat.id} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-signal-cyan"
                      style={{ boxShadow: '0 0 6px rgba(0,229,255,0.5)' }}
                    />
                    <span className="font-display text-xs text-white">{boat.name}</span>
                    {boat.vernacularName && (
                      <span className="font-mono text-[10px] text-white/30">
                        {boat.vernacularName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hazards — ocean cells only */}
          {!isLand && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="data-label">Hazards ({cellHazards.length})</div>
              <button
                onClick={() => setShowHazardModal(true, selectedCell.h3Index)}
                className="text-[10px] font-mono text-signal-cyan hover:text-white transition-colors"
              >
                + Tag
              </button>
            </div>
            {cellHazards.length === 0 ? (
              <div className="text-xs text-white/30 font-mono">No hazards reported</div>
            ) : (
              <div className="flex flex-col gap-3">
                {cellHazards.map((h) => {
                  const trust = computeTrustScore(h);
                  const tColor = trustColor(trust);
                  return (
                    <div
                      key={h.id}
                      className="rounded-xl p-3"
                      style={{
                        background: `${tColor}12`,
                        border: `1px solid ${tColor}35`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span>{HAZARD_ICONS[h.type]}</span>
                          <span className="font-display text-xs font-semibold text-white capitalize">
                            {h.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: tColor }}>
                            AI Trust
                          </span>
                          <span className="font-mono text-sm font-bold" style={{ color: tColor }}>
                            {trust}%
                          </span>
                        </div>
                      </div>

                      <div className="h-1 rounded-full bg-white/10 mb-2 overflow-hidden">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{ width: `${trust}%`, background: tColor }}
                        />
                      </div>
                      <div className="font-mono text-[9px] mb-2" style={{ color: `${tColor}` }}>
                        {trustLabel(trust)}
                      </div>

                      {h.description && (
                        <div className="font-mono text-[11px] text-white/50 mb-2 leading-relaxed">
                          {h.description}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-[10px] text-white/30">
                          {h.reportedBy} ·{' '}
                          {Math.round((Date.now() - new Date(h.reportedAt).getTime()) / 3600000)}h
                          ago
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => confirmHazard(h.id)}
                            className="text-[10px] font-mono text-alert-green hover:text-white transition-colors"
                          >
                            ✓ {h.confirmations}
                          </button>
                          <button
                            onClick={() => disputeHazard(h.id)}
                            className="text-[10px] font-mono text-white/30 hover:text-alert-red transition-colors"
                          >
                            ✗ {h.disputes}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
    </div>
  );
}
