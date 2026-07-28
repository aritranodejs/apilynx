'use client';

import type { DocBlock } from '@/content/docs';
import { DocBlockView } from '@/components/marketing/doc-block-view';
import { Reveal } from '@/components/marketing/reveal';

export function AnimatedDocBody({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="mt-10 space-y-10">
      {blocks.map((block, i) => (
        <Reveal key={`${block.heading ?? 'block'}-${i}`} delay={i * 70}>
          <DocBlockView block={block} />
        </Reveal>
      ))}
    </div>
  );
}
