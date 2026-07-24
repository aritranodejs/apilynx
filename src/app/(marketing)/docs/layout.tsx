import { DocsSidebar } from '@/components/marketing/docs-sidebar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:flex-row lg:gap-14">
      <DocsSidebar />
      <div className="min-w-0 flex-1 pb-16">{children}</div>
    </div>
  );
}
