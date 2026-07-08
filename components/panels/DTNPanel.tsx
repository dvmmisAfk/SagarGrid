'use client';

import { useBoatStore } from '@/store/boatStore';
import { useDTNStore } from '@/store/dtnStore';

export default function DTNPanel() {
  const { messages } = useDTNStore();
  const { boats } = useBoatStore();

  const isolatedBoats = boats.filter((b) => b.connectedTo.length === 0 && b.id !== 'B5');
  const activeMessages = messages.filter(
    (m) => m.status === 'buffered' || m.status === 'carrying'
  );

  return (
    <div
      data-tour="dtn"
      className="glass rounded-2xl p-4"
      style={{
        border: '1px solid rgba(255, 214, 10, 0.25)',
        boxShadow: '0 0 20px rgba(255,214,10,0.1)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-alert-yellow animate-pulse" />
        <div className="data-label" style={{ color: '#FFD60A' }}>
          DTN Active
        </div>
      </div>

      <div className="font-display text-white text-xs font-semibold mb-1">
        Store · Carry · Forward
      </div>
      <div className="font-mono text-[10px] text-white/40 mb-3 leading-relaxed">
        No live mesh link. Message is buffered and relayed when the next boat drifts into range.
      </div>

      {activeMessages.map((msg) => (
        <div
          key={msg.id}
          className="rounded-xl p-2.5 mb-2"
          style={{
            background: 'rgba(255,214,10,0.06)',
            border: '1px solid rgba(255,214,10,0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-alert-yellow uppercase tracking-wider">
              {msg.type === 'sos' ? '🆘 SOS' : msg.type === 'hazard' ? '⚠ Hazard' : '• Ping'}
            </span>
            <span className="font-mono text-[9px] text-white/30">
              {msg.status === 'carrying' ? `Carrying · hop ${msg.hopCount}` : 'Buffered'}
            </span>
          </div>
          <div className="font-mono text-[10px] text-white/60">From: {msg.originBoatName}</div>
          <div className="font-mono text-[10px] text-white/40">Cell: {msg.originCell}</div>
          {msg.payload && (
            <div className="font-mono text-[9px] text-white/30 mt-1 leading-relaxed">
              “{msg.payload}”
            </div>
          )}
          {msg.status === 'carrying' && msg.carrierName && (
            <div className="font-mono text-[10px] text-alert-yellow mt-1">
              Carried by: {msg.carrierName}
            </div>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 h-1 rounded-full bg-white/10">
              <div
                className="h-1 rounded-full bg-alert-yellow transition-all"
                style={{ width: `${Math.min(100, msg.hopCount * 25)}%` }}
              />
            </div>
            <span className="font-mono text-[9px] text-white/30">{msg.hopCount}/4 hops</span>
          </div>
        </div>
      ))}

      {isolatedBoats.length > 0 && activeMessages.length === 0 && (
        <div className="font-mono text-[10px] text-white/40 text-center py-2 leading-relaxed">
          {isolatedBoats.map((b) => b.name).join(', ')} isolated —
          <br />
          message relays on next contact
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-white/5 font-mono text-[9px] text-white/25 leading-relaxed">
        DTN — the same store-carry-forward protocol NASA uses for deep-space links.
      </div>
    </div>
  );
}

export function useDTNPanelVisible(): boolean {
  const { messages } = useDTNStore();
  const { boats } = useBoatStore();
  const isolatedBoats = boats.filter((b) => b.connectedTo.length === 0 && b.id !== 'B5');
  const activeMessages = messages.filter(
    (m) => m.status === 'buffered' || m.status === 'carrying'
  );
  return isolatedBoats.length > 0 || activeMessages.length > 0;
}
