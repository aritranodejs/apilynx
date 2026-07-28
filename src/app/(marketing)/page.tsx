import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero-section';
import { FeaturePillarsGrid } from '@/components/marketing/animated-grids';
import { AnimatedComparisonBlock, AnimatedDownloadBlock } from '@/components/marketing/animated-sections';
import { DownloadGrid } from '@/components/marketing/download-grid';
import { ParallaxSection } from '@/components/marketing/parallax-section';
import { CtaBanner, WhySwitchSection, WorkflowSection } from '@/components/marketing/growth-sections';
import { SITE_URL } from '@/content/downloads';
import { Reveal } from '@/components/marketing/reveal';

export const metadata: Metadata = {
  title: 'Apilynx — Modern API Client',
  description:
    'Build, test, and document HTTP APIs. A fast, free alternative to Postman with collections, environments, GraphQL, mocks, and generated docs.',
  openGraph: {
    title: 'Apilynx — The API client your team actually wants to use',
    description:
      'Free API testing for REST & GraphQL. Download for desktop or try in browser — no account required.',
    url: SITE_URL,
    siteName: 'Apilynx',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Apilynx — Modern API Client' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apilynx — Modern API Client',
    description: 'Free Postman alternative. Test APIs in browser or desktop app.',
    images: ['/og.png'],
  },
  keywords: [
    'API client',
    'Postman alternative',
    'REST client',
    'GraphQL',
    'API testing',
    'Apilynx',
  ],
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <ParallaxSection className="border-t border-white/5 bg-[#07080c]" speed={0.35}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              Everything you need to work an API
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-400">
              The same core workflows you know from Postman — requests, collections, environments,
              tests, docs, mocks, and code snippets.
            </p>
          </Reveal>
          <FeaturePillarsGrid />
          <WhySwitchSection />
          <Reveal delay={200} className="mt-10 text-sm text-zinc-500">
            Prefer a guided tour?{' '}
            <Link href="/docs/examples/" className="text-orange-400 hover:underline">
              Examples cookbook
            </Link>
            {' · '}
            <Link href="/docs/features/" className="text-orange-400 hover:underline">
              Features overview
            </Link>
          </Reveal>
        </div>
      </ParallaxSection>

      <WorkflowSection />

      <ParallaxSection className="border-t border-white/5 bg-[#0a0b0f]" speed={0.28}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              How Apilynx compares
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Side-by-side with Postman, Insomnia, Bruno, Thunder Client, and Hoppscotch.
            </p>
          </Reveal>
          <AnimatedComparisonBlock />
          <Reveal delay={150} className="mt-6 text-sm text-zinc-500">
            Full write-up with migration tips:{' '}
            <Link href="/docs/compare/" className="text-orange-400 hover:underline">
              Compare API clients
            </Link>
            {' · '}
            <Link href="/docs/graphql/" className="text-orange-400 hover:underline">
              GraphQL guide
            </Link>
          </Reveal>
        </div>
      </ParallaxSection>

      <ParallaxSection
        id="download"
        className="border-t border-white/5 bg-gradient-to-b from-[#0a0b0f] to-[#12141c]"
        speed={0.22}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Download Apilynx
            </h2>
            <p className="mt-3 max-w-xl text-zinc-400">
              Pick your platform, install like any other app, and start sending requests.
            </p>
          </Reveal>
          <AnimatedDownloadBlock>
            <DownloadGrid />
          </AnimatedDownloadBlock>
          <Reveal delay={200} className="mt-10 text-sm text-zinc-500">
            Want a walkthrough?{' '}
            <Link href="/docs/download/" className="text-orange-400 hover:underline">
              Installation guide
            </Link>
            {' · '}
            <Link href="/docs/getting-started/" className="text-orange-400 hover:underline">
              Your first request
            </Link>
          </Reveal>
        </div>
      </ParallaxSection>

      <CtaBanner />
    </>
  );
}
