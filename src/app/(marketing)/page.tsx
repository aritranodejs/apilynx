import Link from 'next/link';
import type { Metadata } from 'next';
import { DownloadGrid } from '@/components/marketing/download-grid';
import { ComparisonTable } from '@/components/marketing/comparison-table';
import { HeroApiDemo } from '@/components/marketing/hero-api-demo';
import { FEATURE_PILLARS } from '@/content/comparison';

export const metadata: Metadata = {
  title: 'Apilynx — Modern API Client',
  description:
    'Build, test, and document HTTP APIs. A fast desktop alternative to Postman with collections, environments, and generated docs.',
};

export default function LandingPage() {
  return (
    <>
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 lynx-hero-bg" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 lynx-hero-grid opacity-[0.35]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-1/4 h-[70vh] w-[70vw] max-w-3xl lynx-hero-glow lg:right-0 lg:w-[45%]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-10 xl:gap-16">
          <div className="min-w-0">
            <p className="lynx-fade-up font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
              Apilynx
            </p>
            <h1 className="lynx-fade-up mt-4 text-balance text-xl font-medium leading-snug tracking-tight text-zinc-200 sm:mt-5 sm:text-2xl md:text-3xl [animation-delay:80ms]">
              The API client your team actually wants to use.
            </h1>
            <p className="lynx-fade-up mt-4 max-w-prose text-base leading-relaxed text-zinc-400 [animation-delay:160ms]">
              Test endpoints, organize collections, and publish docs — download once and get to
              work. No terminal required.
            </p>
            <div className="lynx-fade-up mt-9 flex flex-wrap items-center gap-3 [animation-delay:240ms]">
              <a
                href="#download"
                className="inline-flex items-center justify-center rounded-md bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Download free
              </a>
              <Link
                href="/docs/"
                className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40 hover:bg-orange-500/10"
              >
                How it works
              </Link>
              <Link
                href="/app/"
                className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
              >
                Try in browser →
              </Link>
            </div>

            <div className="lynx-fade-up mt-10 lg:hidden [animation-delay:320ms]">
              <HeroApiDemo />
            </div>
          </div>

          <div className="hidden min-w-0 lg:block">
            <HeroApiDemo />
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#07080c]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            Everything you need to work an API
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            The same core workflows you know from Postman — requests, collections, environments,
            tests, docs, mocks, and code snippets.
          </p>
          <ul className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
            {FEATURE_PILLARS.map((f) => (
              <li key={f.title} className="border-l border-orange-500/30 pl-5">
                <h3 className="text-lg font-semibold text-zinc-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-zinc-500">
            Prefer a guided tour?{' '}
            <Link href="/docs/examples/" className="text-orange-400 hover:underline">
              Examples cookbook
            </Link>
            {' · '}
            <Link href="/docs/features/" className="text-orange-400 hover:underline">
              Features overview
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0a0b0f]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            How Apilynx compares
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Side-by-side with Postman, Insomnia, Bruno, Thunder Client, and Hoppscotch.
          </p>
          <div className="mt-8 sm:mt-10">
            <ComparisonTable />
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Full write-up with migration tips:{' '}
            <Link href="/docs/compare/" className="text-orange-400 hover:underline">
              Compare API clients
            </Link>
            {' · '}
            <Link href="/docs/graphql/" className="text-orange-400 hover:underline">
              GraphQL guide
            </Link>
          </p>
        </div>
      </section>

      <section
        id="download"
        className="border-t border-white/5 bg-gradient-to-b from-[#0a0b0f] to-[#12141c]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Download Apilynx
          </h2>
          <p className="mt-3 max-w-xl text-zinc-400">
            Pick your platform, install like any other app, and start sending requests.
          </p>
          <div className="mt-8 sm:mt-10">
            <DownloadGrid />
          </div>
          <p className="mt-10 text-sm text-zinc-500">
            Want a walkthrough?{' '}
            <Link href="/docs/download/" className="text-orange-400 hover:underline">
              Installation guide
            </Link>
            {' · '}
            <Link href="/docs/getting-started/" className="text-orange-400 hover:underline">
              Your first request
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
