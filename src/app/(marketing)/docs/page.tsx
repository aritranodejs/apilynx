import Link from 'next/link';
import type { Metadata } from 'next';
import { DOC_SECTIONS } from '@/content/docs';
import { FeaturePillarsGridCompact, DocsGuideList } from '@/components/marketing/animated-grids';
import { Reveal } from '@/components/marketing/reveal';

export const metadata: Metadata = {
  title: 'Documentation — Apilynx',
  description:
    'Apilynx docs with Postman-style examples, feature guides, and Apilynx vs Postman comparison.',
};

export default function DocsOverviewPage() {
  return (
    <article>
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-wider text-orange-400/90">Documentation</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Apilynx documentation
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          Learn the product with Postman-style walkthroughs: first request, collections,
          environments, auth recipes, GraphQL, an examples cookbook, and comparisons with
          Postman, Insomnia, Bruno, and more.
        </p>
      </Reveal>

      <Reveal delay={100} className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/docs/getting-started/"
          className="lynx-cta-primary inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Your first request
        </Link>
        <Link
          href="/docs/examples/"
          className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          Examples cookbook
        </Link>
        <Link
          href="/docs/why-apilynx-vs-postman/"
          className="inline-flex items-center rounded-md border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:border-orange-500/50 hover:bg-orange-500/15"
        >
          Why Apilynx vs Postman
        </Link>
        <Link
          href="/docs/compare/"
          className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          Compare clients
        </Link>
        <Link
          href="/docs/graphql/"
          className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          GraphQL
        </Link>
      </Reveal>

      <section className="mt-14">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
            What you can do
          </h2>
        </Reveal>
        <FeaturePillarsGridCompact />
      </section>

      <Reveal delay={80}>
        <h2 className="mt-16 text-lg font-semibold text-zinc-200">All guides</h2>
      </Reveal>
      <DocsGuideList sections={DOC_SECTIONS} />
    </article>
  );
}
