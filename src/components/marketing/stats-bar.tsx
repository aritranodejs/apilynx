'use client';

import { useEffect, useRef, useState } from 'react';
import { MARKETING_STATS } from '@/content/marketing';

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

function StatCard({
  value,
  suffix,
  label,
  detail,
  icon: Icon,
}: {
  value: number;
  suffix: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(value, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-3 rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4 transition-colors hover:border-orange-500/20 hover:bg-zinc-900/60 sm:p-5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          <span className="tabular-nums">{count}</span>
          <span className="text-orange-400">{suffix}</span>
        </p>
        <p className="mt-0.5 text-sm font-medium text-zinc-200">{label}</p>
        <p className="mt-0.5 text-xs leading-snug text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}

export function StatsBar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {MARKETING_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
