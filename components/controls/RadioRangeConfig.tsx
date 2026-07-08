'use client';

import { useState } from 'react';
import { useBoatStore } from '@/store/boatStore';

const RANGE_PRESETS = [
  { label: 'Bluetooth LE', km: 0.3, note: 'Standard phone BT' },
  { label: 'WiFi Direct', km: 0.2, note: 'Standard phone WiFi' },
  { label: 'LoRa · 2 m mast', km: 10, note: 'Standard fishing boat' },
  { label: 'LoRa · 5 m mast', km: 18, note: 'Larger vessel' },
  { label: 'LoRa · high gain', km: 25, note: 'Antenna + mast' },
  { label: 'VHF Marine', km: 30, note: 'Licensed VHF radio' },
];

export default function RadioRangeConfig() {
  const [open, setOpen] = useState(false);
  const radioRangeKm = useBoatStore((s) => s.radioRangeKm);
  const setRadioRange = useBoatStore((s) => s.setRadioRange);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass rounded-xl px-3 py-2 font-mono text-xs text-white/50 hover:text-white transition-colors flex items-center gap-2 w-full justify-center"
      >
        📡 Range: {radioRangeKm} km
        <span className="text-white/25">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 glass-cyan rounded-2xl p-3 w-64 shadow-panel-cyan">
          <div className="data-label mb-2">Radio Horizon Configuration</div>
          <div className="font-mono text-[10px] text-white/40 mb-3 leading-relaxed">
            SagarGrid is hardware-agnostic. Range depends on the radio module deployed — LoRa
            achieves 10–25 km over flat water at low power.
          </div>
          <div className="flex flex-col gap-1.5 mb-3">
            {RANGE_PRESETS.map((p) => {
              const active = radioRangeKm === p.km;
              return (
                <button
                  key={p.label}
                  onClick={() => setRadioRange(p.km)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left"
                  style={{
                    background: active ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <div>
                    <div className="font-mono text-xs text-white font-medium">{p.label}</div>
                    <div className="font-mono text-[9px] text-white/30">{p.note}</div>
                  </div>
                  <div className="font-mono text-xs text-signal-cyan">{p.km} km</div>
                </button>
              );
            })}
          </div>

          {radioRangeKm < 1 && (
            <div className="rounded-lg p-2 bg-alert-red/10 border border-alert-red/20">
              <div className="font-mono text-[10px] text-alert-red leading-relaxed">
                ⚠ Standard phone radios can&apos;t form an ocean mesh. Real deployment needs a
                low-cost LoRa node (~₹1,500).
              </div>
            </div>
          )}
          {radioRangeKm >= 10 && (
            <div className="rounded-lg p-2 bg-alert-green/10 border border-alert-green/20">
              <div className="font-mono text-[10px] text-alert-green leading-relaxed">
                ✓ LoRa at this range covers ~{Math.round(Math.PI * radioRangeKm * radioRangeKm)} km²
                per node over flat water.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
