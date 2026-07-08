'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { DEMO_STEPS } from '@/lib/demoScript';

function resolveTarget(focus: string | string[] | null): DOMRect | null {
  if (!focus) return null;
  const list = Array.isArray(focus) ? focus : [focus];
  for (const sel of list) {
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return r;
    }
  }
  return null;
}

// A simulated pointer + spotlight that glides to the UI element each demo step
// refers to, so an audience can follow exactly what the narrator is describing.
export default function GuidedCursor() {
  const demoMode = useUIStore((s) => s.demoMode);
  const demoStep = useUIStore((s) => s.demoStep);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const focus = DEMO_STEPS[demoStep]?.focus ?? null;
  const focusKey = Array.isArray(focus) ? focus.join('|') : focus ?? '';

  useEffect(() => {
    if (!demoMode) {
      setRect(null);
      return;
    }
    const update = () => setRect(resolveTarget(focus));
    update();
    // Poll so late-appearing / moving targets (SOS panel, DTN panel) are tracked.
    const id = window.setInterval(update, 300);
    window.addEventListener('resize', update);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode, demoStep, focusKey]);

  const show = demoMode && rect !== null;
  const cx = rect ? rect.left + rect.width / 2 : 0;
  const cy = rect ? rect.top + rect.height / 2 : 0;

  return (
    <AnimatePresence>
      {show && rect && (
        <>
          {/* Spotlight ring around the referenced element */}
          <motion.div
            key="ring"
            className="fixed pointer-events-none z-[1400]"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              left: rect.left - 8,
              top: rect.top - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 210, damping: 26 }}
            style={{
              borderRadius: 16,
              border: '2px solid #00E5FF',
              boxShadow: '0 0 0 3px rgba(0,229,255,0.12), 0 0 26px rgba(0,229,255,0.5)',
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ borderRadius: 16, border: '2px solid rgba(0,229,255,0.4)' }}
            />
          </motion.div>

          {/* Simulated cursor pointer — tip anchored at the element centre */}
          <motion.div
            key="cursor"
            className="fixed pointer-events-none z-[1401]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, left: cx, top: cy }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 20 }}
          >
            <div className="relative">
              {/* Pulsing pointing ripple at the tip */}
              <motion.div
                className="absolute rounded-full"
                animate={{ scale: [0.6, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  left: -6,
                  top: -6,
                  width: 28,
                  height: 28,
                  background: 'radial-gradient(circle, rgba(0,229,255,0.55) 0%, transparent 70%)',
                }}
              />
              <svg width="26" height="26" viewBox="0 0 26 26" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}>
                <path
                  d="M3 2 L3 20 L8.5 15 L12 22.5 L15 21 L11.5 13.5 L19 13.5 Z"
                  fill="#ffffff"
                  stroke="#00A9C4"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
