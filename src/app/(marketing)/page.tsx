import Link from 'next/link';
import type { Metadata } from 'next';
import { DownloadGrid } from '@/components/marketing/download-grid';

export const metadata: Metadata = {
  title: 'Apilynx — Modern API Client',
  description:
    'Build, test, and document HTTP APIs. A fast desktop alternative to Postman with collections, environments, and generated docs.',
};

const features = [
  {
    title: 'Send any request',
    text: 'GET, POST, and more — with params, headers, JSON bodies, and auth in one place.',
  },
  {
    title: 'Collections that stay organized',
    text: 'Save endpoints into folders, switch environments, and run a whole collection in one go.',
  },
  {
    title: 'Docs your team can read',
    text: 'Turn a collection into clean, shareable API documentation — export when you are ready.',
  },
  {
    title: 'Built for real API work',
    text: 'Desktop app with no browser CORS headaches. History, mocks, and code snippets included.',
  },
];

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
          className="pointer-events-none absolute -right-24 top-1/4 h-[70vh] w-[70vw] max-w-3xl lynx-hero-glow"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0a0b0f]/40 to-[#0a0b0f]" />
          <div className="lynx-request-plane absolute inset-8 flex flex-col justify-center gap-3 font-mono text-[11px] leading-relaxed text-zinc-400/90 sm:inset-12">
            {[
              { m: 'GET', u: '/api/v1/users', s: '200', d: '42ms' },
              { m: 'POST', u: '/api/v1/auth/login', s: '201', d: '118ms' },
              { m: 'PATCH', u: '/api/v1/orders/8821', s: '200', d: '67ms' },
              { m: 'DELETE', u: '/api/v1/sessions', s: '204', d: '31ms' },
            ].map((row, i) => (
              <div
                key={row.u}
                className="lynx-request-row flex items-center gap-4 border-l-2 border-orange-500/40 pl-4"
                style={{ animationDelay: `${0.15 * i}s` }}
              >
                <span
                  className={
                    row.m === 'GET'
                      ? 'text-emerald-400'
                      : row.m === 'POST'
                        ? 'text-orange-400'
                        : row.m === 'PATCH'
                          ? 'text-sky-400'
                          : 'text-rose-400'
                  }
                >
                  {row.m}
                </span>
                <span className="truncate text-zinc-300">{row.u}</span>
                <span className="ml-auto shrink-0 text-zinc-500">
                  {row.s} · {row.d}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-5 py-20 sm:px-8 lg:max-w-[58%] lg:pr-0 xl:max-w-6xl xl:pr-[42%]">
          <p className="lynx-fade-up font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
            Apilynx
          </p>
          <h1 className="lynx-fade-up mt-5 max-w-xl text-2xl font-medium tracking-tight text-zinc-200 sm:text-3xl [animation-delay:80ms]">
            The API client your team actually wants to use.
          </h1>
          <p className="lynx-fade-up mt-4 max-w-md text-base leading-relaxed text-zinc-400 [animation-delay:160ms]">
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
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#07080c]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to work an API
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            From the first request to published docs — one clear workflow.
          </p>
          <ul className="mt-14 grid gap-10 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title} className="border-l border-orange-500/30 pl-5">
                <h3 className="text-lg font-semibold text-zinc-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="download"
        className="border-t border-white/5 bg-gradient-to-b from-[#0a0b0f] to-[#12141c]"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white">
            Download Apilynx
          </h2>
          <p className="mt-3 max-w-xl text-zinc-400">
            Pick your platform, install like any other app, and start sending requests.
          </p>
          <div className="mt-10">
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
