'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collectionService, requestService } from '@/services/ipc';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateCollectionDocs, downloadHtml } from '@/lib/docs-generator';
import { BookOpen, Download, ExternalLink } from 'lucide-react';
import type { Collection } from '@/types';

export function DocsPanel() {
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);
  const user = useAuthStore((s) => s.user);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [collectionDesc, setCollectionDesc] = useState('');

  const { data: collections = [] } = useQuery({
    queryKey: ['collections', activeProjectId, user?.id],
    queryFn: () => collectionService.getAll(activeProjectId ?? undefined),
  });

  const selected = collections.find((c) => c.id === selectedId) ?? collections[0];

  const { data: requests = [] } = useQuery({
    queryKey: ['requests', selected?.id],
    queryFn: () => requestService.getByCollection(selected!.id),
    enabled: !!selected?.id,
  });

  const html = useMemo(() => {
    if (!selected) return '';
    const col: Collection = { ...selected, description: collectionDesc || selected.description };
    return generateCollectionDocs(col, requests, baseUrl);
  }, [selected, requests, baseUrl, collectionDesc]);

  const handleSelect = (col: Collection) => {
    setSelectedId(col.id);
    setCollectionDesc(col.description ?? '');
  };

  const handleExport = () => {
    if (!selected || !html) return;
    downloadHtml(`${selected.name.replace(/\s+/g, '-').toLowerCase()}-docs.html`, html);
  };

  const handlePreview = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const handleSaveDescription = async () => {
    if (!selected) return;
    await collectionService.update(selected.id, { description: collectionDesc });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-zinc-600 flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> API Documentation
        </p>
        <select
          value={selected?.id ?? ''}
          onChange={(e) => {
            const col = collections.find((c) => c.id === e.target.value);
            if (col) handleSelect(col);
          }}
          className="w-full rounded bg-zinc-900 border border-zinc-700 text-xs px-2 py-1.5 text-zinc-200"
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Base URL for docs"
          className="text-xs"
        />
        <Input
          value={collectionDesc}
          onChange={(e) => setCollectionDesc(e.target.value)}
          placeholder="Collection description..."
          className="text-xs"
          onBlur={() => void handleSaveDescription()}
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={handlePreview} disabled={!html}>
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={handleExport} disabled={!html}>
            <Download className="h-3.5 w-3.5" /> Export HTML
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white">
        {collections.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500 text-center">Create a collection to generate docs</p>
        ) : html ? (
          <iframe title="API Documentation preview" srcDoc={html} className="w-full h-full border-0" />
        ) : null}
      </div>
    </div>
  );
}
