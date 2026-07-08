'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useGridStore } from '@/store/gridStore';
import { HazardType } from '@/types';
import { h3IndexToShortCode } from '@/lib/h3utils';

const HAZARD_TYPES = [
  { id: 'reef', icon: '🔴', label: 'Reef / Rock', desc: 'Submerged rock or reef' },
  { id: 'ghost_net', icon: '🟠', label: 'Ghost Net', desc: 'Abandoned fishing net' },
  { id: 'wreck', icon: '☠️', label: 'Shipwreck', desc: 'Sunken vessel or wreck' },
  { id: 'rough_current', icon: '🌊', label: 'Rough Current', desc: 'Dangerous water current' },
  { id: 'other', icon: '⚠️', label: 'Other', desc: 'Other sea hazard' },
] as const;

export default function HazardModal() {
  const { showHazardModal, hazardModalCell, setShowHazardModal } = useUIStore();
  const { addHazard } = useGridStore();
  const [selected, setSelected] = useState<HazardType | null>(null);
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected || !hazardModalCell) return;
    addHazard(hazardModalCell, selected, 'Arjun', desc || undefined);
    setSubmitted(true);
    setTimeout(() => {
      setShowHazardModal(false);
      setSelected(null);
      setDesc('');
      setSubmitted(false);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {showHazardModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowHazardModal(false)}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-cyan rounded-2xl p-5 w-full max-w-sm shadow-panel-cyan"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <div className="text-4xl mb-3">✅</div>
                <div className="font-display font-bold text-white text-lg mb-1">Hazard Tagged</div>
                <div className="font-mono text-xs text-alert-green">Visible to all boats in range</div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="data-label mb-1">Tag a Hazard</div>
                    {hazardModalCell && (
                      <div className="cell-code text-sm">{h3IndexToShortCode(hazardModalCell)}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowHazardModal(false)}
                    className="text-white/30 hover:text-white transition-colors text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  {HAZARD_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelected(type.id)}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        background:
                          selected === type.id ? 'rgba(255,149,0,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${
                          selected === type.id ? 'rgba(255,149,0,0.4)' : 'rgba(255,255,255,0.08)'
                        }`,
                      }}
                    >
                      <span className="text-xl flex-shrink-0">{type.icon}</span>
                      <div>
                        <div className="font-display text-sm font-medium text-white">{type.label}</div>
                        <div className="font-mono text-[10px] text-white/40">{type.desc}</div>
                      </div>
                      {selected === type.id && <div className="ml-auto text-alert-orange">✓</div>}
                    </button>
                  ))}
                </div>

                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Optional description (e.g. 'Rock 2m below surface')"
                  className="w-full rounded-xl px-3 py-2.5 mb-4 font-mono text-xs text-white/80 placeholder-white/20 resize-none"
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    outline: 'none',
                  }}
                  rows={2}
                />

                <button
                  onClick={handleSubmit}
                  disabled={!selected}
                  className="w-full py-2.5 rounded-xl font-display font-semibold text-sm transition-all"
                  style={{
                    background: selected ? 'rgba(255,149,0,0.9)' : 'rgba(255,255,255,0.06)',
                    color: selected ? '#fff' : 'rgba(255,255,255,0.3)',
                    cursor: selected ? 'pointer' : 'not-allowed',
                  }}
                >
                  Report Hazard
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
