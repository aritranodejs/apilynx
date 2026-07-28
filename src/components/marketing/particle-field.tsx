'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  variant?: 'hero' | 'docs';
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
};

export function ParticleField({ className, variant = 'hero' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDocs = variant === 'docs';
    const mobile = window.innerWidth < 768;
    const count = isDocs ? (mobile ? 18 : 28) : mobile ? 32 : 58;
    const linkDist = isDocs ? 90 : 120;
    const particles: Particle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      particles.length = 0;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (isDocs ? 0.25 : 0.45),
          vy: (Math.random() - 0.5) * (isDocs ? 0.25 : 0.45),
          r: Math.random() * 1.6 + 0.8,
          hue: Math.random() > 0.7 ? 25 : Math.random() > 0.5 ? 160 : 220,
        });
      }
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === 25
            ? 'rgba(249, 115, 22, 0.55)'
            : p.hue === 160
              ? 'rgba(52, 211, 153, 0.35)'
              : 'rgba(148, 163, 184, 0.3)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]!;
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * (isDocs ? 0.12 : 0.22);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      frameRef.current = window.requestAnimationFrame(draw);
    };

    resize();
    seed();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      seed();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden
    />
  );
}
