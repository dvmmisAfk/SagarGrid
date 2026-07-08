'use client';

// Persistent advisory disclaimer — limits liability exposure by making clear
// SagarGrid is a decision-support layer, not certified navigation equipment.
export default function DisclaimerBar() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[998] text-center py-1 pointer-events-none"
      style={{ background: 'linear-gradient(to top, rgba(5,13,26,0.9) 0%, transparent 100%)' }}
    >
      <span className="font-mono text-[9px] tracking-wider text-white/20">
        ADVISORY PLATFORM ONLY · Not for sole navigational use · Verify all alerts independently ·
        SagarGrid assumes no liability for navigational decisions
      </span>
    </div>
  );
}
