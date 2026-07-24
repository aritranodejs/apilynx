import Link from 'next/link';
import type { Metadata } from 'next';
import { DOC_SECTIONS } from '@/content/docs';
import { FEATURE_PILLARS } from '@/content/comparison';

export const metadata: Metadata = {
  title: 'Documentation — Apilynx',
  description:
    'Apilynx docs with Postman-style examples, feature guides, and Apilynx vs Postman comparison.',
};

export default function DocsOverviewPage() {
  return (
    <article>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Apilynx documentation
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
        Learn the product with Postman-style walkthroughs: first request, collections,
        environments, auth recipes, GraphQL, an examples cookbook, and comparisons with
        Postman, Insomnia, Bruno, and more.
      </p>

      <p className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/docs/getting-started/"
          className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Your first request
        </Link>
        <Link
          href="/docs/examples/"
          className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40"
        >
          Examples cookbook
        </Link>
        <Link
          href="/docs/compare/"
          className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40"
        >
          Compare clients
        </Link>
        <Link
          href="/docs/graphql/"
          className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40"
        >
          GraphQL
        </Link>
      </p>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
          What you can do
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {FEATURE_PILLARS.map((f) => (
            <li key={f.title} className="border-l border-orange-500/30 pl-4">
              <h3 className="font-medium text-zinc-100">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mt-16 text-lg font-semibold text-zinc-200">All guides</h2>
      <ul className="mt-4 space-y-0 divide-y divide-white/5 border-y border-white/5">
        {DOC_SECTIONS.map((section) => (
          <li key={section.slug}>
            <Link
              href={`/docs/${section.slug}/`}
              className="group flex flex-col gap-1 py-5 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
            >
              <span className="font-medium text-zinc-100 group-hover:text-orange-400">
                {section.title}
              </span>
              <span className="text-sm text-zinc-500 sm:max-w-md sm:text-right">
                {section.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
