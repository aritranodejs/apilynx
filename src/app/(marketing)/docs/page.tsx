import Link from 'next/link';
import type { Metadata } from 'next';
import { DOC_SECTIONS } from '@/content/docs';

export const metadata: Metadata = {
  title: 'Documentation — Apilynx',
  description: 'Learn how to use Apilynx: download, requests, collections, environments, and docs.',
};

export default function DocsOverviewPage() {
  return (
    <article>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        How to use Apilynx
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
        Simple guides for the desktop API client — install the app, send requests, organize
        collections, and publish documentation. Written for people who use APIs, not for
        developers setting up a codebase.
      </p>

      <p className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/docs/download/"
          className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Download the app
        </Link>
        <Link
          href="/docs/getting-started/"
          className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40"
        >
          Your first request
        </Link>
      </p>

      <ul className="mt-12 space-y-0 divide-y divide-white/5 border-y border-white/5">
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
