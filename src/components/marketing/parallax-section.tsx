'use client';

import { useScrollParallax } from '@/hooks/use-parallax';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  speed?: number;
  id?: string;
};

/** Section with subtle scroll parallax on decorative background blobs. */
export function ParallaxSection({ children, className, speed = 0.3, id }: Props) {
  const { ref, offset } = useScrollParallax<HTMLElement>(speed);

  return (
    <section id={id} ref={ref} className={cn('lynx-section relative', className)}>
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-40 w-40 rounded-full bg-orange-500/[0.04] blur-3xl"
        style={{ transform: `translateY(${offset * 0.4}px)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-1/4 h-48 w-48 rounded-full bg-sky-500/[0.03] blur-3xl"
        style={{ transform: `translateY(${offset * -0.35}px)` }}
        aria-hidden
      />
      <div className="lynx-section-line absolute inset-x-0 top-0 h-px" aria-hidden />
      {children}
    </section>
  );
}
