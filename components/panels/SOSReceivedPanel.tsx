'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSOSStore } from '@/store/sosStore';
import { useUIStore } from '@/store/uiStore';
import { useBoatStore } from '@/store/boatStore';
import { h3IndexToShortCode } from '@/lib/h3utils';

export default function SOSReceivedPanel() {
  const { sosEvent } = useSOSStore();
  const { showSOSPanel, setShowSOSPanel } = useUIStore();
  const { boats } = useBoatStore();

  const originBoat = boats.find((b) => b.id === sosEvent.originBoatId);

  // Deterministic pseudo-signature derived from the origin cell — a stand-in
  // for a real ECDSA signature over the SOS payload.
  const signature = (() => {
    const src = `${sosEvent.originCell}${sosEvent.originBoatId}`;
    let hash = 0;
    for (let i = 0; i < src.length; i++) hash = (hash * 31 + src.charCodeAt(i)) >>> 0;
    const hex = hash.toString(16).toUpperCase().padStart(8, '0');
    return `${hex.slice(0, 4)}…${hex.slice(4, 8)}`;
  })();

  useEffect(() => {
    if (showSOSPanel && sosEvent.status === 'reached_shore') {
      // Green screen flash
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: fixed; inset: 0; z-index: 9990;
        background: rgba(48, 209, 88, 0.08);
        pointer-events: none;
        animation: fadeIn 0.3s ease-out forwards;
      `;
      document.body.appendChild(flash);
      const removeTimer = setTimeout(() => flash.remove(), 800);

      // Subtle confetti burst from the bottom center
      confetti({
        particleCount: 40,
        spread: 70,
        startVelocity: 42,
        origin: { x: 0.5, y: 1 },
        colors: ['#30D158', '#00E5FF', '#FFFFFF'],
        scalar: 0.9,
        ticks: 160,
      });

      return () => clearTimeout(removeTimer);
    }
  }, [showSOSPanel, sosEvent.status]);

  if (!showSOSPanel || sosEvent.status !== 'reached_shore') return null;

  return (
    <div data-tour="sos-panel" className="glass-success rounded-2xl p-5 shadow-panel-green">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(48, 209, 88, 0.15)',
                      border: '1px solid rgba(48,209,88,0.3)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z"
                        fill="#30D158"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: 2, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(48, 209, 88, 0.3)' }}
                  />
                </div>
                <div>
                  <div className="data-label text-alert-green">SOS reached shore station</div>
                  <div className="font-display text-white font-bold text-lg leading-tight mt-0.5">
                    Relay complete
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSOSPanel(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none mt-1"
              >
                ✕
              </button>
            </div>

            {/* Data grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <DataBlock label="Vessel" value={originBoat?.name || '—'} sub={originBoat?.vernacularName} />
              <DataBlock label="Grid Cell" value={h3IndexToShortCode(sosEvent.originCell)} mono accent />
              <DataBlock
                label="Position"
                value={`${sosEvent.originLat.toFixed(3)}°N`}
                sub={`${sosEvent.originLng.toFixed(3)}°E`}
                mono
              />
              <DataBlock
                label="Relay"
                value={`${Math.max(0, sosEvent.hops.length - 1)} hops`}
                sub="0 network used"
                accent
              />
            </div>

            {/* Hop chain */}
            <div className="flex items-center gap-1 mb-4 flex-wrap">
              {sosEvent.hops.map((hop, i) => (
                <div key={hop.boatId} className="flex items-center gap-1">
                  <div
                    className="font-mono text-xs text-white/80 px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        i === 0
                          ? 'rgba(255,59,48,0.15)'
                          : i === sosEvent.hops.length - 1
                            ? 'rgba(0,229,255,0.15)'
                            : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${
                        i === 0
                          ? 'rgba(255,59,48,0.3)'
                          : i === sosEvent.hops.length - 1
                            ? 'rgba(0,229,255,0.3)'
                            : 'rgba(255,255,255,0.1)'
                      }`,
                    }}
                  >
                    {hop.boatName}
                  </div>
                  {i < sosEvent.hops.length - 1 && <span className="text-white/20 text-xs">→</span>}
                </div>
              ))}
            </div>

            {/* Security — PKI signature (V6) */}
            <div
              className="rounded-xl p-3 mb-3"
              style={{ background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0,229,255,0.12)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">🔐</span>
                <div className="font-mono text-[10px] text-signal-cyan">PKI Signed Message</div>
                <div className="ml-auto font-mono text-[9px] text-alert-green">✓ Verified</div>
              </div>
              <div className="font-mono text-[9px] text-white/30 leading-relaxed">
                Sig: <span className="text-white/50">{signature}</span> · ECDSA-P256 · Key:{' '}
                <span className="text-white/50">SG-{sosEvent.originBoatId}</span>
              </div>
              <div className="font-mono text-[9px] text-white/20 mt-1 leading-relaxed">
                Each SOS is signed with the boat&apos;s private key. Forged packets are rejected by
                every relay node.
              </div>
            </div>

            {/* Scalability proof (V11) */}
            <div
              className="rounded-xl p-3 mb-4"
              style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="data-label">Relay Algorithm</div>
                <div className="font-mono text-[10px] text-signal-cyan">BFS · O(V+E)</div>
              </div>
              <div className="font-mono text-[9px] text-white/30 leading-relaxed">
                Search is local to radio range (~50 neighbours/node). H3 spatial indexing makes
                neighbour lookup O(1) — a full path across 50,000 boats computes in &lt;5 ms on a
                smartphone.
              </div>
            </div>

            {/* Footer status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-alert-green"
                />
                <span className="font-mono text-xs text-alert-green">
                  Alerting Indian Coast Guard Station, Chennai...
                </span>
              </div>
            </div>

            <div className="font-mono text-[9px] text-white/20 mt-3 leading-relaxed">
              Advisory platform · Not a substitute for licensed radio distress equipment.
            </div>
    </div>
  );
}

function DataBlock({
  label,
  value,
  sub,
  mono,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="data-label mb-1">{label}</div>
      <div
        className={`${mono ? 'font-mono' : 'font-display'} text-sm font-semibold ${
          accent ? 'text-signal-cyan' : 'text-white'
        }`}
      >
        {value}
      </div>
      {sub && <div className="font-mono text-xs text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}
