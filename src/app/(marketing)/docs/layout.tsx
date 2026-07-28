import { DocsSidebar } from '@/components/marketing/docs-sidebar';
import { DocsAmbience } from '@/components/marketing/docs-ambience';
import { Reveal } from '@/components/marketing/reveal';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:flex-row lg:gap-14">
      <DocsAmbience />
      <DocsSidebar />
      <Reveal className="relative z-10 min-w-0 flex-1 pb-16" delay={80}>
        {children}
      </Reveal>
    </div>
  );
}
