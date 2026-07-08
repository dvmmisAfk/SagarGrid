'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';

// HTML overlays that sit on top of the Leaflet map (Leaflet layer components
// cannot render arbitrary positioned DOM, so these live outside the map).
export default function MapOverlays() {
  const networkOnline = useUIStore((s) => s.networkOnline);
  const showWeatherOverlay = useUIStore((s) => s.showWeatherOverlay);
  const showBorderZone = useUIStore((s) => s.showBorderZone);
  const selectedCell = useUIStore((s) => s.selectedCell);

  return (
    <>
      {/* V2 — offline vector map indicator */}
      <AnimatePresence>
        {!networkOnline && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-4 left-4 z-[1000]"
          >
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-alert-green" />
              <span className="font-mono text-xs text-white/60">
                Vector map · Fully offline · No tiles needed
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* V9 — weather data source attribution */}
      <AnimatePresence>
        {showWeatherOverlay && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute top-[104px] left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
          >
            <div className="glass rounded-full px-4 py-1.5 flex items-center gap-3 whitespace-nowrap">
              <span className="font-mono text-[10px] text-white/40">Data source</span>
              <span className="font-mono text-[10px] text-alert-yellow font-semibold">
                IMD Cyclone Advisory (Simulated)
              </span>
              <span className="font-mono text-[10px] text-white/20">·</span>
              <span className="font-mono text-[10px] text-white/40">
                Phase 2: INCOIS Ocean State Forecast API
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* V1c + V10 — border zone resolution legend + attribution */}
      <AnimatePresence>
        {showBorderZone && !selectedCell && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="absolute top-20 right-4 z-[1000] w-60 pointer-events-none"
          >
            <div
              data-tour="border-legend"
              className="glass rounded-2xl p-3"
              style={{ border: '1px solid rgba(255,59,48,0.25)' }}
            >
              <div className="data-label mb-2" style={{ color: '#FF3B30' }}>
                Border Zone · Adaptive H3
              </div>
              <div className="flex flex-col gap-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-signal-cyan/30 opacity-40 flex-shrink-0" />
                  <span className="font-mono text-[10px] text-white/50">H3-6 · ~36 km² · Ocean</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ background: 'rgba(255,59,48,0.28)', border: '1px solid #FF6B60' }}
                  />
                  <span className="font-mono text-[10px] text-white/50">
                    H3-8 · ~0.74 km² · <span className="text-alert-red">49× finer</span>
                  </span>
                </div>
              </div>
              <div className="font-mono text-[10px] text-white/50 leading-relaxed mb-2">
                Catches a crossing within ~860 m — a res-6 cell would hide it.
              </div>
              <div className="font-mono text-[9px] text-white/25 leading-relaxed border-t border-white/5 pt-2">
                Production imports official EEZ shapefiles from Ministry of Earth Sciences boundary
                datasets.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
