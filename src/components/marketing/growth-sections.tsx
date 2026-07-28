'use client';

import Link from 'next/link';
import { WHY_SWITCH, WORKFLOW_STEPS } from '@/content/marketing';
import { Reveal } from '@/components/marketing/reveal';
import { cn } from '@/lib/utils';

export function WorkflowSection() {
  return (
    <section className="relative border-t border-white/5 bg-[#0a0b0f]">
      <div className="lynx-section-line absolute inset-x-0 top-0 h-px" aria-hidden />
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400/90">
            How it works
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            From zero to first API call in minutes
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            No steep learning curve — if you have used Postman or Insomnia, you already know the flow.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {WORKFLOW_STEPS.map((step, i) => (
            <Reveal key={step.step} delay={i * 80}>
              <div className="h-full rounded-xl border border-white/10 bg-zinc-900/30 p-6 transition-colors hover:border-orange-500/20">
                <span className={cn('font-mono text-xs font-bold', step.accent)}>{step.step}</span>
                <h3 className="mt-3 text-base font-semibold text-zinc-100 sm:text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhySwitchSection() {
  return (
    <div className="mt-14 border-t border-white/5 pt-14">
      <Reveal>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white sm:text-2xl">
          Why developers try Apilynx
        </h3>
      </Reveal>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {WHY_SWITCH.map((item, i) => (
          <Reveal
            key={item.title}
            delay={i * 70}
            className="rounded-xl border border-white/10 bg-zinc-900/20 p-5 transition-colors hover:border-orange-500/15"
          >
            <h4 className="font-medium text-zinc-100">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden border-t border-white/5">
      <div className="pointer-events-none absolute inset-0 lynx-cta-bg" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your next API request is one click away
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Download the desktop app or open Apilynx in your browser — free, no signup required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#download"
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
            >
              Download free
            </a>
            <Link
              href="/app/"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40"
            >
              Try in browser
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
