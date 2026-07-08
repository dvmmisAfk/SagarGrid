'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoatStore } from '@/store/boatStore';
import { useSOSStore } from '@/store/sosStore';
import { useUIStore } from '@/store/uiStore';
import { computeSOSRelayChain, buildSOSHops } from '@/lib/sosRelay';
import { h3IndexToShortCode } from '@/lib/h3utils';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SOSButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const { setBoatStatus, setFrozen } = useBoatStore();
  const { initSOS, advanceHop, completeSOS, resetSOS } = useSOSStore();
  const { setNetworkOnline, setShowSOSPanel } = useUIStore();

  const trigger = async () => {
    if (state !== 'idle') return;
    setState('running');
    setFrozen(true);
    setNetworkOnline(false);

    const boats = useBoatStore.getState().boats;
    const origin = boats.find((b) => b.id === 'B1')!;
    const chain = computeSOSRelayChain('B1', boats, 25);
    const hops = buildSOSHops(chain, boats, h3IndexToShortCode);
    initSOS('B1', origin.currentCell, origin.lat, origin.lng, hops);
    setBoatStatus('B1', 'sos_origin');

    for (let i = 0; i < hops.length; i++) {
      await delay(1500);
      advanceHop(i, 'relaying');
      if (i > 0) setBoatStatus(hops[i].boatId, 'sos_relay_active');
      await delay(400);
      advanceHop(i, 'done');
      if (i > 0) setBoatStatus(hops[i].boatId, 'sos_relay_done');
    }

    await delay(400);
    completeSOS();
    setShowSOSPanel(true);
    setState('done');
  };

  const reset = () => {
    resetSOS();
    setShowSOSPanel(false);
    setNetworkOnline(true);
    setFrozen(false);
    setState('idle');
    useBoatStore.getState().boats.forEach((b) => setBoatStatus(b.id, 'normal'));
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <AnimatePresence>
        {state === 'done' && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            onClick={reset}
            className="px-4 py-1.5 rounded-full font-mono text-xs border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all"
          >
            ↺ Reset
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        data-tour="sos"
        onClick={trigger}
        disabled={state !== 'idle'}
        whileTap={state === 'idle' ? { scale: 0.94 } : {}}
        className="relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all"
        style={{
          background:
            state === 'running'
              ? 'rgba(180, 30, 20, 0.8)'
              : state === 'done'
                ? 'rgba(20, 80, 30, 0.8)'
                : 'rgba(220, 40, 30, 0.9)',
          border: `1.5px solid ${state === 'done' ? 'rgba(48,209,88,0.5)' : 'rgba(255,59,48,0.5)'}`,
          boxShadow:
            state === 'idle'
              ? '0 0 24px rgba(255,59,48,0.4), 0 4px 16px rgba(0,0,0,0.5)'
              : state === 'running'
                ? '0 0 32px rgba(255,59,48,0.6), 0 4px 16px rgba(0,0,0,0.5)'
                : '0 0 20px rgba(48,209,88,0.4)',
          cursor: state !== 'idle' ? 'default' : 'pointer',
        }}
      >
        {/* Pulsing ring when running */}
        {state === 'running' && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ scale: [1, 1.5, 2], opacity: [0.6, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeOut' }}
            style={{ background: 'rgba(255,59,48,0.3)', borderRadius: '16px' }}
          />
        )}

        <span className="text-xl leading-none">{state === 'done' ? '✓' : '🆘'}</span>
        <span className="font-mono text-[9px] font-bold text-white mt-0.5 tracking-wider">
          {state === 'running' ? 'TX...' : state === 'done' ? 'DONE' : 'SOS'}
        </span>
      </motion.button>
    </div>
  );
}
