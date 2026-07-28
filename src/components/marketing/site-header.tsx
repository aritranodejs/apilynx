'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/#download', label: 'Download' },
  { href: '/docs/', label: 'Docs' },
  { href: '/app/', label: 'Try in browser' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0b0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <img src="/icon.png" alt="" className="h-8 w-8 shrink-0 rounded-lg" />
          <span className="truncate font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-orange-400">
            Apilynx
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex md:gap-2">
          {links.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} />
          ))}
        </nav>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#0a0b0f] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                pathname={pathname}
                mobile
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  link,
  pathname,
  mobile = false,
  onNavigate,
}: {
  link: (typeof links)[number];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const isApp = link.href === '/app/';
  const isDocs = link.href === '/docs/';
  const active = isDocs
    ? pathname.startsWith('/docs')
    : isApp
      ? pathname.startsWith('/app')
      : false;

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
        mobile && 'py-2.5',
        active ? 'text-orange-400' : 'text-zinc-400 hover:text-zinc-100',
        link.href === '/#download' &&
          'bg-orange-500 text-white hover:bg-orange-400 hover:text-white',
        mobile && link.href === '/#download' && 'text-center'
      )}
    >
      {link.label}
    </Link>
  );
}
