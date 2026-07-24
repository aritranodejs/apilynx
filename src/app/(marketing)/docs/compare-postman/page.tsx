'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Old URL — keep for bookmarks; forwards to the multi-tool comparison page. */
export default function ComparePostmanRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/docs/compare/');
  }, [router]);

  return (
    <p className="px-5 py-16 text-sm text-zinc-500 sm:px-8">
      Redirecting to the comparison guide…
    </p>
  );
}
