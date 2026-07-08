'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useSOSStore } from '@/store/sosStore';

export default function SOSCanvas() {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  // Read from the store imperatively inside the animation loop to avoid re-subscribing.
  const getState = useSOSStore.getState;

  useEffect(() => {
    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '500';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const resize = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };
    resize();
    map.on('resize', resize);

    const start = performance.now();

    const draw = (now: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { sosEvent } = getState();
      const hops = sosEvent.hops;

      if (sosEvent.status === 'relaying' || sosEvent.status === 'reached_shore') {
        const t = (now - start) / 1000;

        for (let i = 0; i < hops.length - 1; i++) {
          const from = hops[i];
          const to = hops[i + 1];
          // Segment is "engaged" once the sending hop has started relaying/done.
          const engaged = from.status === 'relaying' || from.status === 'done';
          if (!engaged) continue;

          const p1 = map.latLngToContainerPoint([from.lat, from.lng]);
          const p2 = map.latLngToContainerPoint([to.lat, to.lng]);

          // Control point for arc (perpendicular offset)
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const bow = Math.min(len * 0.25, 60);
          const cx = mx + nx * bow;
          const cy = my + ny * bow;

          const complete = to.status === 'done';
          const progress = complete ? 1 : Math.min(1, ((t % 1.2) / 1.2) * 1.4);

          // Glowing arc trail — cyan while in-flight, green once delivered
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
          ctx.strokeStyle = complete ? 'rgba(48,209,88,0.8)' : 'rgba(0,229,255,0.6)';
          ctx.lineWidth = complete ? 2.5 : 2;
          ctx.shadowColor = complete ? '#30D158' : '#00E5FF';
          ctx.shadowBlur = complete ? 8 : 10;
          ctx.stroke();

          // Traveling pulse along the curve
          if (!complete) {
            const bx =
              (1 - progress) * (1 - progress) * p1.x +
              2 * (1 - progress) * progress * cx +
              progress * progress * p2.x;
            const by =
              (1 - progress) * (1 - progress) * p1.y +
              2 * (1 - progress) * progress * cy +
              progress * progress * p2.y;
            ctx.beginPath();
            ctx.arc(bx, by, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD60A';
            ctx.shadowColor = '#FFD60A';
            ctx.shadowBlur = 16;
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }

        // PKI verified badge at the shore node once the relay is complete
        if (sosEvent.status === 'reached_shore' && hops.length > 0) {
          const last = hops[hops.length - 1];
          const s = map.latLngToContainerPoint([last.lat, last.lng]);
          const label = '🔐 Signature verified';
          ctx.font = '600 11px "JetBrains Mono", monospace';
          const tw = ctx.measureText(label).width;
          const bx = s.x + 12;
          const by = s.y - 34;
          ctx.fillStyle = 'rgba(5,13,26,0.85)';
          ctx.strokeStyle = 'rgba(48,209,88,0.6)';
          ctx.lineWidth = 1;
          const padX = 8;
          const bw = tw + padX * 2;
          const bh = 20;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(bx, by, bw, bh, 6);
          } else {
            ctx.rect(bx, by, bw, bh);
          }
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#30D158';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, bx + padX, by + bh / 2);
        }

        // Pulsing ring on the origin boat
        if (hops.length > 0) {
          const o = map.latLngToContainerPoint([hops[0].lat, hops[0].lng]);
          const r = 8 + (Math.sin(t * 6) + 1) * 8;
          ctx.beginPath();
          ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,59,48,${0.7 - r / 60})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = '#FF3B30';
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      map.off('resize', resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map, getState]);

  return null;
}
