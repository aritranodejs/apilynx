'use client';

import Link from 'next/link';
import { FEATURE_PILLARS } from '@/content/comparison';
import { Reveal } from '@/components/marketing/reveal';

export function FeaturePillarsGrid({ className }: { className?: string }) {
  return (
    <ul className={className ?? 'mt-10 grid gap-8 sm:mt-14 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3'}>
      {FEATURE_PILLARS.map((f, i) => (
        <Reveal
          key={f.title}
          as="li"
          delay={i * 90}
          className="lynx-feature-card border-l border-orange-500/30 pl-5"
        >
          <h3 className="text-lg font-semibold text-zinc-100">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.text}</p>
        </Reveal>
      ))}
    </ul>
  );
}

export function FeaturePillarsGridCompact() {
  return (
    <ul className="mt-6 grid gap-6 sm:grid-cols-2">
      {FEATURE_PILLARS.map((f, i) => (
        <Reveal
          key={f.title}
          as="li"
          delay={i * 70}
          className="lynx-feature-card border-l border-orange-500/30 pl-4"
        >
          <h3 className="font-medium text-zinc-100">{f.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.text}</p>
        </Reveal>
      ))}
    </ul>
  );
}

export function DocsGuideList({
  sections,
}: {
  sections: { slug: string; title: string; description: string }[];
}) {
  return (
    <ul className="mt-4 space-y-0 divide-y divide-white/5 border-y border-white/5">
      {sections.map((section, i) => (
        <Reveal key={section.slug} as="li" delay={i * 50}>
          <Link
            href={`/docs/${section.slug}/`}
            className="group flex flex-col gap-1 py-5 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
          >
            <span className="font-medium text-zinc-100 transition-colors group-hover:text-orange-400">
              {section.title}
            </span>
            <span className="text-sm text-zinc-500 transition-colors sm:max-w-md sm:text-right group-hover:text-zinc-400">
              {section.description}
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
