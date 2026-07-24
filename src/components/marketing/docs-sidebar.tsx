'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_SECTIONS } from '@/content/docs';
import { cn } from '@/lib/utils';

export function DocsSidebar() {
  const pathname = usePathname();
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Documentation
      </p>
      <nav className="mt-4 flex flex-row gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        <NavItem href="/docs/" active={normalized === '/docs/'}>
          Overview
        </NavItem>
        {DOC_SECTIONS.map((section) => {
          const href = `/docs/${section.slug}/`;
          return (
            <NavItem key={section.slug} href={href} active={normalized === href}>
              {section.title}
            </NavItem>
          );
        })}
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors',
        active
          ? 'bg-orange-500/15 font-medium text-orange-400'
          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
      )}
    >
      {children}
    </Link>
  );
}
