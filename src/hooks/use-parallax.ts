'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.35) {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = -rect.top / Math.max(rect.height, 1);
      setOffset(progress * speed * 100);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed]);

  return { ref: ref as RefObject<T>, offset };
}

export function useMouseParallax(intensity = 1) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarse) return;

    const onMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 2 * intensity;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 2 * intensity;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [intensity]);

  return offset;
}
