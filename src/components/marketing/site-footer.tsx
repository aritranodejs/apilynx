import Link from 'next/link';
import { GITHUB_REPO } from '@/content/downloads';

export function SiteFooter() {
  const githubUrl = `https://github.com/${GITHUB_REPO}`;

  return (
    <footer className="border-t border-white/5 bg-[#07080c]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-100">
              Apilynx
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
              A modern, free API client for teams who want Postman-style workflows without the bloat.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/app/" className="transition-colors hover:text-orange-400">
                  Try in browser
                </Link>
              </li>
              <li>
                <Link href="/#download" className="transition-colors hover:text-orange-400">
                  Download
                </Link>
              </li>
              <li>
                <Link href="/docs/features/" className="transition-colors hover:text-orange-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/docs/why-apilynx-vs-postman/" className="transition-colors hover:text-orange-400">
                  Why vs Postman
                </Link>
              </li>
              <li>
                <Link href="/docs/compare/" className="transition-colors hover:text-orange-400">
                  Compare clients
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Learn</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/docs/getting-started/" className="transition-colors hover:text-orange-400">
                  Getting started
                </Link>
              </li>
              <li>
                <Link href="/docs/examples/" className="transition-colors hover:text-orange-400">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/docs/graphql/" className="transition-colors hover:text-orange-400">
                  GraphQL
                </Link>
              </li>
              <li>
                <Link href="/docs/" className="transition-colors hover:text-orange-400">
                  All docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Community</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-orange-400"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={`${githubUrl}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-orange-400"
                >
                  Report an issue
                </a>
              </li>
              <li>
                <span className="text-zinc-600">MIT License</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Aritra Dutta · Built for developers who live in APIs
      </div>
    </footer>
  );
}
