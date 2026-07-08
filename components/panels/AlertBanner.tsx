'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function AlertBanner() {
  const { activeAlert, setActiveAlert } = useUIStore();

  useEffect(() => {
    if (!activeAlert) return;
    const t = setTimeout(() => setActiveAlert(null), 7000);
    return () => clearTimeout(t);
  }, [activeAlert, setActiveAlert]);

  if (!activeAlert) return null;

  const isBorder = activeAlert.type === 'border';
  const isWeather = activeAlert.type === 'weather';

  return (
    <div
      className={isBorder ? 'glass-danger' : isWeather ? 'glass-danger' : 'glass'}
      style={{
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: isBorder || isWeather
          ? '0 0 0 1px rgba(255,59,48,0.3), 0 8px 32px rgba(255,59,48,0.2)'
          : '0 0 0 1px rgba(255,149,0,0.3), 0 8px 32px rgba(255,149,0,0.15)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl mt-0.5">
          {isBorder ? '🚨' : isWeather ? '🌊' : '⚠️'}
        </div>
        <div className="flex-1">
          <div
            className="font-display font-bold text-sm mb-1"
            style={{ color: isBorder || isWeather ? '#FF3B30' : '#FF9500' }}
          >
            {isBorder
              ? 'Border Zone Warning'
              : isWeather
                ? 'Weather Auto-Distress'
                : 'Hazard Detected'}
          </div>
          <div className="font-mono text-xs text-white/70 leading-relaxed">
            {activeAlert.message}
          </div>
          <div className="font-mono text-[9px] text-white/25 mt-2">
            Advisory only — verify independently.
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveAlert(null)}
            className="text-[10px] font-mono px-3 py-1 rounded-full border border-white/20 text-white/60 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
