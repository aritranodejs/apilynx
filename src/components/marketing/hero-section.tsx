'use client';

import Link from 'next/link';
import { HeroApiDemo } from '@/components/marketing/hero-api-demo';
import { HeroAmbience } from '@/components/marketing/hero-ambience';
import { ParticleField } from '@/components/marketing/particle-field';
import { StatsBar } from '@/components/marketing/stats-bar';
import { Reveal } from '@/components/marketing/reveal';
import { useMouseParallax, useScrollParallax } from '@/hooks/use-parallax';
import { cn } from '@/lib/utils';
import { HERO_BADGE, HERO_TRUST_LINE } from '@/content/marketing';

export function HeroSection() {
  const { ref: sectionRef, offset: scrollY } = useScrollParallax<HTMLElement>(0.55);
  const mouse = useMouseParallax(0.6);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden pb-8 sm:pb-12"
    >
      <div
        className="pointer-events-none absolute inset-0 lynx-hero-bg"
        style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 lynx-hero-grid opacity-[0.2]"
        style={{
          transform: `translateY(${scrollY * 0.2}px) translate(${mouse.x * 4}px, ${mouse.y * 3}px)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-[60vh] w-[55vw] max-w-2xl lynx-hero-glow lg:right-0"
        style={{
          transform: `translateY(${scrollY * 0.28}px) translate(${mouse.x * -8}px, ${mouse.y * -6}px)`,
        }}
        aria-hidden
      />

      <ParticleField variant="hero" className="opacity-70" />

      <div
        style={{
          transform: `translateY(${scrollY * 0.15}px) translate(${mouse.x * 6}px, ${mouse.y * 5}px)`,
        }}
      >
        <HeroAmbience mouse={mouse} scrollY={scrollY} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div
            className="min-w-0"
            style={{
              transform: `translateY(${scrollY * -0.06}px) translate(${mouse.x * -3}px, ${mouse.y * -2}px)`,
            }}
          >
            <span className="lynx-fade-up inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[11px] font-medium text-orange-200 sm:text-xs">
              <span className="lynx-live-dot h-1.5 w-1.5 rounded-full bg-orange-400" />
              {HERO_BADGE}
            </span>

            <h1 className="lynx-fade-up mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl [animation-delay:60ms]">
              Apilynx
            </h1>
            <p className="lynx-fade-up mt-4 text-balance text-lg font-medium leading-snug text-zinc-200 sm:text-xl md:text-2xl [animation-delay:120ms]">
              The API client your team actually wants to use.
            </p>
            <p className="lynx-fade-up mt-4 max-w-prose text-sm leading-relaxed text-zinc-400 sm:text-base [animation-delay:180ms]">
              Test endpoints, organize collections, and publish docs — download once or open in
              your browser. No terminal required.
            </p>
            <p className="lynx-fade-up mt-3 text-xs text-zinc-500 [animation-delay:200ms]">
              {HERO_TRUST_LINE}
            </p>

            <div className="lynx-fade-up mt-8 flex flex-wrap items-center gap-3 [animation-delay:240ms]">
              <a
                href="#download"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                Download free
              </a>
              <Link
                href="/app/"
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40 hover:bg-orange-500/10"
              >
                Try in browser
              </Link>
              <Link
                href="/docs/getting-started/"
                className="inline-flex items-center justify-center px-2 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
              >
                Quick start →
              </Link>
            </div>
          </div>

          <Reveal direction="scale" delay={160} className="min-w-0 lg:order-none">
            <div
              className={cn('lynx-parallax-tilt transition-transform duration-200 ease-out')}
              style={{
                transform: `perspective(900px) rotateX(${mouse.y * -1.5}deg) rotateY(${mouse.x * 2}deg) translateY(${scrollY * -0.08}px)`,
              }}
            >
              <HeroApiDemo />
            </div>
          </Reveal>
        </div>

        <div className="lynx-fade-up mt-12 sm:mt-14 [animation-delay:300ms]">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
            Built for modern API teams
          </p>
          <StatsBar />
        </div>
      </div>
    </section>
  );
}
