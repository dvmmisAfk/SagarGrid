'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useBoatStore } from '@/store/boatStore';
import { useSOSStore } from '@/store/sosStore';
import { useMapStore } from '@/store/mapStore';
import { useDTNStore } from '@/store/dtnStore';
import { useVoiceStore } from '@/store/voiceStore';
import { computeSOSRelayChain, buildSOSHops } from '@/lib/sosRelay';
import { h3IndexToShortCode } from '@/lib/h3utils';
import { DEMO_STEPS as STEPS } from '@/lib/demoScript';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function DemoController() {
  const {
    demoMode,
    demoStep,
    setDemoStep,
    setDemoMode,
    setNetworkOnline,
    setShowBorderZone,
    setShowHazardMap,
    setShowWeatherOverlay,
    setShowSOSPanel,
    setActiveAlert,
    setSelectedCell,
    narrationEnabled,
    setNarrationEnabled,
    autoPlay,
    setAutoPlay,
    replayNarration,
  } = useUIStore();

  const voices = useVoiceStore((s) => s.voices);
  const selectedVoiceURI = useVoiceStore((s) => s.selectedVoiceURI);
  const setSelectedVoiceURI = useVoiceStore((s) => s.setSelectedVoiceURI);
  const enVoices = voices.filter((v) => /^en/i.test(v.lang));

  const step = STEPS[demoStep];
  const total = STEPS.length;

  const runStep = async (s: number) => {
    setDemoStep(s);
    const boatState = useBoatStore.getState();
    const sos = useSOSStore.getState();
    const map = useMapStore.getState().map;

    switch (s) {
      case 0: {
        setNetworkOnline(true);
        setShowBorderZone(false);
        setShowHazardMap(false);
        setShowWeatherOverlay(false);
        setShowSOSPanel(false);
        setActiveAlert(null);
        setSelectedCell(null);
        boatState.setFrozen(false);
        sos.resetSOS();
        useDTNStore.getState().clearAll();
        boatState.initBoats();
        map?.flyTo([10.5, 80.1], 9, { duration: 1.2 });
        break;
      }
      case 1: {
        boatState.setFrozen(false);
        break;
      }
      case 2: {
        boatState.setFrozen(true);
        break;
      }
      case 3: {
        setNetworkOnline(false);
        // Demonstrate store-carry-forward: buffer a distress message that the
        // mesh will carry once a boat drifts back into range.
        const dtn = useDTNStore.getState();
        dtn.clearAll();
        const boats = useBoatStore.getState().boats;
        const isolated = boats.find((b) => b.connectedTo.length === 0 && b.id !== 'B5');
        const carrier = isolated ?? boats.find((b) => b.id === 'B1');
        if (carrier) {
          dtn.bufferMessage({
            type: 'sos',
            originBoatId: carrier.id,
            originBoatName: carrier.name,
            originCell: h3IndexToShortCode(carrier.currentCell),
            payload: 'Engine failure · requesting assistance',
            ttlHours: 24,
          });
        }
        break;
      }
      case 4: {
        setNetworkOnline(false);
        boatState.setFrozen(true);
        const boats = useBoatStore.getState().boats;
        const origin = boats.find((b) => b.id === 'B1')!;
        const chain = computeSOSRelayChain('B1', boats, 25);
        const hops = buildSOSHops(chain, boats, h3IndexToShortCode);
        sos.initSOS('B1', origin.currentCell, origin.lat, origin.lng, hops);
        useBoatStore.getState().setBoatStatus('B1', 'sos_origin');
        for (let i = 0; i < hops.length; i++) {
          await delay(1500);
          useSOSStore.getState().advanceHop(i, 'relaying');
          if (i > 0) useBoatStore.getState().setBoatStatus(hops[i].boatId, 'sos_relay_active');
          await delay(400);
          useSOSStore.getState().advanceHop(i, 'done');
          if (i > 0) useBoatStore.getState().setBoatStatus(hops[i].boatId, 'sos_relay_done');
        }
        await delay(400);
        useSOSStore.getState().completeSOS();
        setShowSOSPanel(true);
        // The buffered DTN distress message rides the relay through to shore.
        useDTNStore.getState().messages.forEach((m) => useDTNStore.getState().deliverMessage(m.id));
        break;
      }
      case 5: {
        setShowSOSPanel(false);
        sos.resetSOS();
        useBoatStore.getState().boats.forEach((b) => boatState.setBoatStatus(b.id, 'normal'));
        setShowBorderZone(true);
        await delay(400);
        useBoatStore.getState().setBoatPosition('B4', 9.58, 79.58);
        useBoatStore.getState().setBoatStatus('B4', 'border_alert');
        setActiveAlert({
          type: 'border',
          message:
            'Boat: Rajan · Cell: Approaching IMBL · Est. distance: ~1.2 km · At current speed: ~8 minutes to crossing. Turn back immediately.',
        });
        map?.flyTo([9.58, 79.58], 9, { duration: 1.2 });
        break;
      }
      case 6: {
        setActiveAlert(null);
        setShowHazardMap(true);
        useBoatStore.getState().boats.forEach((b) => boatState.setBoatStatus(b.id, 'normal'));
        map?.flyTo([10.5, 80.1], 9, { duration: 1.2 });
        break;
      }
      case 7: {
        setShowWeatherOverlay(true);
        map?.flyTo([11.4, 81.3], 8, { duration: 1.2 });
        break;
      }
      case 8: {
        setShowBorderZone(true);
        setShowHazardMap(true);
        setShowWeatherOverlay(true);
        map?.flyTo([10.6, 80.3], 8, { duration: 1.2 });
        break;
      }
    }
  };

  // Keep the latest runStep so the auto-play event listener always advances
  // with current closures.
  const runStepRef = useRef(runStep);
  runStepRef.current = runStep;

  useEffect(() => {
    const handler = () => {
      const st = useUIStore.getState().demoStep;
      if (st < STEPS.length - 1) runStepRef.current(st + 1);
    };
    window.addEventListener('sagargrid:demo-next', handler);
    return () => window.removeEventListener('sagargrid:demo-next', handler);
  }, []);

  if (!demoMode) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1500] w-[560px] max-w-[calc(100vw-2rem)]"
    >
      <div className="glass-cyan rounded-2xl p-5 shadow-panel-cyan">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => runStep(i)}
                className="transition-all rounded-full"
                style={{
                  width: i === demoStep ? '20px' : '6px',
                  height: '6px',
                  background:
                    i === demoStep
                      ? '#00E5FF'
                      : i < demoStep
                        ? 'rgba(0,229,255,0.4)'
                        : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>
          <div className="font-mono text-[10px] text-white/30 ml-auto">
            {demoStep + 1} / {total}
          </div>

          {/* Narrator controls */}
          <div className="flex items-center gap-1">
            <button
              title={narrationEnabled ? 'Mute narrator' : 'Unmute narrator'}
              onClick={() => setNarrationEnabled(!narrationEnabled)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
              style={{
                background: narrationEnabled ? 'rgba(0,229,255,0.14)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${narrationEnabled ? 'rgba(0,229,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
                color: narrationEnabled ? '#00E5FF' : 'rgba(255,255,255,0.4)',
              }}
            >
              {narrationEnabled ? '🔊' : '🔇'}
            </button>
            <button
              title="Replay narration"
              onClick={() => replayNarration()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
            >
              ↻
            </button>
            <button
              title={autoPlay ? 'Auto-play on' : 'Auto-play off'}
              onClick={() => {
                const next = !autoPlay;
                setAutoPlay(next);
                if (next) {
                  setNarrationEnabled(true);
                  replayNarration();
                }
              }}
              className="h-7 px-2 rounded-lg flex items-center justify-center font-mono text-[10px] transition-all"
              style={{
                background: autoPlay ? 'rgba(48,209,88,0.16)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${autoPlay ? 'rgba(48,209,88,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: autoPlay ? '#30D158' : 'rgba(255,255,255,0.4)',
              }}
            >
              {autoPlay ? '❚❚ Auto' : '▶ Auto'}
            </button>
          </div>

          <button
            onClick={() => {
              setAutoPlay(false);
              setDemoMode(false);
            }}
            className="text-white/20 hover:text-white/60 transition-colors text-sm leading-none ml-1"
          >
            ✕
          </button>
        </div>

        {/* Voice picker */}
        {narrationEnabled && enVoices.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider flex-shrink-0">
              Voice
            </span>
            <select
              value={selectedVoiceURI ?? ''}
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                replayNarration();
              }}
              className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-1 font-mono text-[10px] text-white/70 focus:outline-none focus:border-signal-cyan/40"
            >
              {enVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI} className="bg-ocean-900 text-white">
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={demoStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl flex-shrink-0 mt-0.5">{step.emoji}</div>
              <div>
                <div className="font-display font-bold text-white text-base leading-tight mb-1">
                  {step.title}
                </div>
                <div className="font-mono text-xs text-white/50 leading-relaxed">
                  {step.narration}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => demoStep > 0 && runStep(demoStep - 1)}
            disabled={demoStep === 0}
            className="px-4 py-2 rounded-xl font-mono text-xs border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            onClick={() => demoStep < total - 1 && runStep(demoStep + 1)}
            disabled={demoStep === total - 1}
            className="flex-1 py-2 rounded-xl font-display font-semibold text-sm transition-all"
            style={{
              background: demoStep < total - 1 ? '#00E5FF' : 'rgba(255,255,255,0.1)',
              color: demoStep < total - 1 ? '#050D1A' : 'rgba(255,255,255,0.3)',
            }}
          >
            {demoStep === total - 1 ? 'End of Demo' : 'Next →'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
