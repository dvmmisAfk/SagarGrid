'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] bg-ocean-950 flex flex-col items-center justify-center"
        >
          {/* Animated hex grid background */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                  <polygon
                    points="30,2 58,17 58,35 30,50 2,35 2,17"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hex)" />
            </svg>
          </div>

          {/* Logo mark — animated hex with SG */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-8"
          >
            <svg width="80" height="80" viewBox="0 0 80 80">
              <polygon
                points="40,4 72,22 72,58 40,76 8,58 8,22"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2"
                opacity="0.4"
              />
              <motion.polygon
                points="40,4 72,22 72,58 40,76 8,58 8,22"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2"
                strokeDasharray="200"
                initial={{ strokeDashoffset: 200 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ delay: 0.2, duration: 1, ease: 'easeInOut' }}
              />
              <text
                x="40"
                y="46"
                textAnchor="middle"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="700"
                fontSize="18"
                fill="#00E5FF"
                letterSpacing="2"
              >
                SG
              </text>
            </svg>
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping-slow opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 70%)',
              }}
            />
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center"
          >
            <div className="font-display text-3xl font-bold text-white tracking-tight mb-1">
              SagarGrid
            </div>
            <div className="font-mono text-xs text-signal-cyan tracking-widest uppercase opacity-70">
              An address for every wave
            </div>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '180px' }}
            transition={{ delay: 0.5, duration: 1.5, ease: 'easeInOut' }}
            className="mt-10 h-px bg-signal-cyan rounded-full"
            style={{ boxShadow: '0 0 8px #00E5FF' }}
          />

          {/* Samsung badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="absolute bottom-10 font-mono text-xs tracking-widest uppercase text-white opacity-20"
          >
            Samsung Solve for Tomorrow 2026
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
