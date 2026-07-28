'use client';

import { ParticleField } from '@/components/marketing/particle-field';
import { useMouseParallax, useScrollParallax } from '@/hooks/use-parallax';

export function DocsAmbience() {
  const { ref, offset } = useScrollParallax<HTMLDivElement>(0.25);
  const mouse = useMouseParallax(0.6);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <ParticleField variant="docs" />
      <div
        className="lynx-docs-orb absolute -right-32 top-0 h-80 w-80 rounded-full bg-orange-500/6 blur-3xl"
        style={{ transform: `translate(${mouse.x * 12}px, ${offset * 0.2 + mouse.y * 8}px)` }}
      />
      <div
        className="lynx-docs-orb-reverse absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl"
        style={{ transform: `translate(${mouse.x * -10}px, ${offset * -0.15 + mouse.y * -6}px)` }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          transform: `translateY(${offset * 0.1}px)`,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
