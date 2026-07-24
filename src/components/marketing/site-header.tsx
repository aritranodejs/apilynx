'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/#download', label: 'Download' },
  { href: '/docs/', label: 'Docs' },
  { href: '/app/', label: 'Try in browser' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0b0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <img src="/icon.png" alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-orange-400">
            Apilynx
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isApp = link.href === '/app/';
            const isDocs = link.href === '/docs/';
            const active = isDocs
              ? pathname.startsWith('/docs')
              : isApp
                ? pathname.startsWith('/app')
                : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'text-orange-400' : 'text-zinc-400 hover:text-zinc-100',
                  link.href === '/#download' &&
                    'bg-orange-500 px-3.5 py-1.5 text-white hover:bg-orange-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
