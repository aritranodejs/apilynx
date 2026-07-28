'use client';

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  direction?: 'up' | 'left' | 'right' | 'scale';
};

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  direction = 'up',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass =
    direction === 'left'
      ? 'lynx-reveal-left'
      : direction === 'right'
        ? 'lynx-reveal-right'
        : direction === 'scale'
          ? 'lynx-reveal-scale'
          : 'lynx-reveal-up';

  return (
    <Tag
      ref={ref as never}
      className={cn('lynx-reveal', directionClass, visible && 'lynx-reveal-visible', className)}
      style={{ '--lynx-reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
