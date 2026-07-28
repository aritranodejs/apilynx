'use client';

import type { ReactNode } from 'react';
import { Reveal } from '@/components/marketing/reveal';
import { ComparisonTable } from '@/components/marketing/comparison-table';

export function AnimatedComparisonBlock() {
  return (
    <Reveal className="mt-8 sm:mt-10">
      <ComparisonTable />
    </Reveal>
  );
}

/** Wrap server-rendered download UI — keep DownloadGrid out of the client bundle. */
export function AnimatedDownloadBlock({ children }: { children: ReactNode }) {
  return (
    <Reveal delay={120}>
      <div className="lynx-download-wrap mt-8 sm:mt-10">{children}</div>
    </Reveal>
  );
}
