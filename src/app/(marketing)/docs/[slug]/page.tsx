import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DownloadGrid } from '@/components/marketing/download-grid';
import { ComparisonTable } from '@/components/marketing/comparison-table';
import { DOC_SECTIONS, getDoc, type DocBlock } from '@/content/docs';

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

function DocBlockView({ block }: { block: DocBlock }) {
  const hasHeading = Boolean(block.heading);
  return (
    <section>
      {block.heading && (
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">{block.heading}</h2>
      )}
      {block.paragraphs.map((p, j) => (
        <p
          key={j}
          className={`max-w-3xl text-[15px] leading-relaxed text-zinc-400 ${
            hasHeading || j > 0 ? 'mt-3' : ''
          }`}
        >
          {p}
        </p>
      ))}
      {block.list && block.list.length > 0 && (
        <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-400">
          {block.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {block.table && (
        <div className="mt-4 max-w-4xl overflow-x-auto rounded-md border border-white/10">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead className="bg-white/5 text-zinc-200">
              <tr>
                {block.table.headers.map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-white/5 text-zinc-400">
                  {row.map((cell, ci) => (
                    <td key={`${ri}-${ci}`} className="px-3 py-2.5 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {block.code && (
        <pre className="mt-4 max-w-3xl overflow-x-auto rounded-md border border-white/10 bg-black/50 p-4 font-mono text-[13px] leading-relaxed text-zinc-300">
          <code>{block.code}</code>
        </pre>
      )}
      {block.callout && (
        <p className="mt-4 max-w-3xl border-l-2 border-orange-500/50 bg-orange-500/5 px-4 py-3 text-sm leading-relaxed text-zinc-300">
          {block.callout}
        </p>
      )}
    </section>
  );
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
      <p className="text-xs font-medium uppercase tracking-wider text-orange-400/90">Guide</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {doc.title}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-zinc-400">{doc.description}</p>

      {slug === 'download' && (
        <div className="mt-10">
          <DownloadGrid compact />
        </div>
      )}

      <div className="mt-10 space-y-10">
        {doc.body.map((block, i) => (
          <DocBlockView key={i} block={block} />
        ))}
      </div>

      {slug === 'compare' && (
        <div className="mt-10">
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
        </div>
      )}

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
    </article>
  );
}
