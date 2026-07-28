import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DownloadGrid } from '@/components/marketing/download-grid';
import { ComparisonTable } from '@/components/marketing/comparison-table';
import { AnimatedDocBody } from '@/components/marketing/animated-doc-body';
import { Reveal } from '@/components/marketing/reveal';
import { DOC_SECTIONS, getDoc } from '@/content/docs';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DOC_SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: 'Docs — Apilynx' };
  return {
    title: `${doc.title} — Apilynx Docs`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const index = DOC_SECTIONS.findIndex((s) => s.slug === slug);
  const prev = index > 0 ? DOC_SECTIONS[index - 1] : null;
  const next = index < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[index + 1] : null;

  return (
    <article>
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-wider text-orange-400/90">Guide</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-400">{doc.description}</p>
      </Reveal>

      {slug === 'download' && (
        <Reveal delay={100} className="mt-10">
          <DownloadGrid compact />
        </Reveal>
      )}

      <AnimatedDocBody blocks={doc.body} />

      {slug === 'compare' && (
        <Reveal delay={80} className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            Detailed comparison table
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-500">
            Apilynx vs Postman, Insomnia, Bruno, Thunder Client, and Hoppscotch. Scroll
            horizontally on smaller screens.
          </p>
          <div className="mt-5">
            <ComparisonTable />
          </div>
        </Reveal>
      )}

      <Reveal delay={120}>
        <nav className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
          {prev ? (
            <Link
              href={`/docs/${prev.slug}/`}
              className="text-sm text-zinc-400 transition-colors hover:text-orange-400"
            >
              ← {prev.title}
            </Link>
          ) : (
            <Link
              href="/docs/"
              className="text-sm text-zinc-400 transition-colors hover:text-orange-400"
            >
              ← Overview
            </Link>
          )}
          {next ? (
            <Link
              href={`/docs/${next.slug}/`}
              className="text-sm text-orange-400/90 transition-colors hover:text-orange-400 sm:text-right"
            >
              {next.title} →
            </Link>
          ) : (
            <Link
              href="/app/"
              className="text-sm text-orange-400 transition-colors hover:underline sm:text-right"
            >
              Open App →
            </Link>
          )}
        </nav>
      </Reveal>
    </article>
  );
}
