'use client';

import { cn } from '@/lib/utils';

const FLOATING = [
  { label: 'GET', sub: '/v1/users', x: '8%', y: '14%', delay: 0, dur: 16, color: 'text-emerald-400/25', depth: 1.2 },
  { label: 'QUERY', sub: '/v1/search', x: '42%', y: '22%', delay: 0.8, dur: 17, color: 'text-violet-400/25', depth: 1.4 },
  { label: 'POST', sub: '/auth/login', x: '72%', y: '12%', delay: 1.2, dur: 18, color: 'text-orange-400/25', depth: 1.5 },
  { label: '200', sub: '42ms', x: '85%', y: '38%', delay: 0.6, dur: 14, color: 'text-emerald-400/20', depth: 0.9 },
  { label: 'PATCH', sub: '/orders', x: '6%', y: '52%', delay: 2, dur: 20, color: 'text-sky-400/25', depth: 1.1 },
  { label: 'DELETE', sub: '/sessions', x: '68%', y: '58%', delay: 1.8, dur: 17, color: 'text-rose-400/25', depth: 1.3 },
  { label: '201', sub: '118ms', x: '18%', y: '78%', delay: 0.3, dur: 15, color: 'text-orange-400/20', depth: 0.8 },
];

type Props = {
  mouse?: { x: number; y: number };
  scrollY?: number;
};

export function HeroAmbience({ mouse = { x: 0, y: 0 }, scrollY = 0 }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="lynx-orb lynx-orb-a absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"
        style={{
          transform: `translate(${mouse.x * 18}px, ${mouse.y * 14 + scrollY * 0.3}px)`,
        }}
      />
      <div
        className="lynx-orb lynx-orb-b absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-orange-600/8 blur-3xl"
        style={{
          transform: `translate(${mouse.x * -22}px, ${mouse.y * -16 + scrollY * 0.45}px)`,
        }}
      />
      <div
        className="lynx-orb lynx-orb-c absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-3xl"
        style={{
          transform: `translate(calc(-50% + ${mouse.x * 10}px), calc(-50% + ${mouse.y * 8 + scrollY * 0.2}px))`,
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.14]"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate(${mouse.x * 5}px, ${mouse.y * 4 + scrollY * 0.15}px)`,
        }}
      >
        <path
          d="M 80 120 Q 400 80 720 140"
          fill="none"
          stroke="url(#lynx-line-grad)"
          strokeWidth="1"
          className="lynx-connection-line"
        />
        <path
          d="M 60 380 Q 350 320 740 360"
          fill="none"
          stroke="url(#lynx-line-grad)"
          strokeWidth="1"
          className="lynx-connection-line"
          style={{ animationDelay: '1.5s' }}
        />
        <defs>
          <linearGradient id="lynx-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {FLOATING.map((item) => (
        <div
          key={`${item.label}-${item.x}`}
          className="absolute"
          style={{
            left: item.x,
            top: item.y,
            transform: `translate(${mouse.x * 8 * item.depth}px, ${mouse.y * 6 * item.depth + scrollY * 0.1 * item.depth}px)`,
          }}
        >
          <div
            className={cn('lynx-float font-mono', item.color)}
            style={{
              animationDuration: `${item.dur}s`,
              animationDelay: `${item.delay}s`,
            }}
          >
            <span className="text-[10px] font-bold sm:text-[11px]">{item.label}</span>
            <span className="ml-1 text-[9px] opacity-70 sm:text-[10px]">{item.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
