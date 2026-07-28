'use client';

import { Reveal } from '@/components/marketing/reveal';
import { DownloadGrid } from '@/components/marketing/download-grid';
import { ComparisonTable } from '@/components/marketing/comparison-table';

export function AnimatedComparisonBlock() {
  return (
    <Reveal className="mt-8 sm:mt-10">
      <ComparisonTable />
    </Reveal>
  );
}

export function AnimatedDownloadBlock() {
  return (
    <Reveal delay={120}>
      <div className="lynx-download-wrap mt-8 sm:mt-10">
        <DownloadGrid />
      </div>
    </Reveal>
  );
}
