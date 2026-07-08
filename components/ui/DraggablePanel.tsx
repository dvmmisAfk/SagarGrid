'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PanelId, usePanelLayoutStore } from '@/store/panelLayoutStore';

interface DraggablePanelProps {
  id: PanelId;
  title?: string;
  children: React.ReactNode;
  className?: string;
  width?: number | string;
  visible?: boolean;
  minWidth?: number;
}

export default function DraggablePanel({
  id,
  title,
  children,
  className = '',
  width,
  visible = true,
  minWidth,
}: DraggablePanelProps) {
  const positions = usePanelLayoutStore((s) => s.positions);
  const zOrder = usePanelLayoutStore((s) => s.zOrder);
  const initDefaults = usePanelLayoutStore((s) => s.initDefaults);
  const setPosition = usePanelLayoutStore((s) => s.setPosition);
  const bringToFront = usePanelLayoutStore((s) => s.bringToFront);

  const [ready, setReady] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initDefaults();
    setReady(true);
  }, [initDefaults]);

  const pos = positions[id];
  const zIndex = zOrder[id] ?? 1000;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!pos) return;
      bringToFront(id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      e.preventDefault();
    },
    [pos, id, bringToFront]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition(id, {
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [id, setPosition]);

  if (!visible || !ready || !pos) return null;

  return (
    <div
      ref={panelRef}
      className={`select-none ${className}`}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex,
        width: width ?? 'auto',
        minWidth,
        touchAction: 'none',
      }}
      onPointerDown={() => bringToFront(id)}
    >
      <div
        onPointerDown={onPointerDown}
        className="flex items-center gap-2 px-2 py-1 mb-1 rounded-lg cursor-grab active:cursor-grabbing group"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        title="Drag to move"
      >
        <span className="text-white/25 group-hover:text-white/45 text-[10px] tracking-widest leading-none">
          ⠿
        </span>
        {title && (
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider truncate">
            {title}
          </span>
        )}
      </div>
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}
