import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#07080c]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-100">
            Apilynx
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Modern API testing — by Aritra Dutta
          </p>
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
          <Link href="/#download" className="hover:text-orange-400 transition-colors">
            Download
          </Link>
          <Link href="/docs/" className="hover:text-orange-400 transition-colors">
            Docs
          </Link>
          <Link href="/app/" className="hover:text-orange-400 transition-colors">
            Try in browser
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        MIT License · © {new Date().getFullYear()} Aritra Dutta
      </div>
    </footer>
  );
}
