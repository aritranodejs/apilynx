'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collectionService, requestService } from '@/services/ipc';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { generateCollectionDocs, downloadHtml } from '@/lib/docs-generator';
import { methodColor, cn } from '@/lib/utils';
import { showSuccess } from '@/stores/toast-store';
import { BookOpen, Download, Maximize2, FileText } from 'lucide-react';
import type { Collection } from '@/types';

export function DocsPanel() {
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);
  const user = useAuthStore((s) => s.user);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [focusedRequestId, setFocusedRequestId] = useState<string | null>(null);

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

  useEffect(() => {
    if (selected) {
      setCollectionDesc(selected.description ?? '');
    }
  }, [selected?.id, selected?.description]);

  const html = useMemo(() => {
    if (!selected) return '';
    const col: Collection = { ...selected, description: collectionDesc || selected.description };
    return generateCollectionDocs(col, requests, baseUrl);
  }, [selected, requests, baseUrl, collectionDesc]);

  const handleSelect = (col: Collection) => {
    setSelectedId(col.id);
    setCollectionDesc(col.description ?? '');
    setFocusedRequestId(null);
  };

  const handleExport = () => {
    if (!selected || !html) return;
    downloadHtml(`${selected.name.replace(/\s+/g, '-').toLowerCase()}-docs.html`, html);
    showSuccess('Documentation exported as HTML');
  };

  const handleSaveDescription = async () => {
    if (!selected) return;
    await collectionService.update(selected.id, { description: collectionDesc });
    showSuccess('Collection description saved');
  };

  const focusedRequest = requests.find((r) => r.id === focusedRequestId);

  return (
    <div className="flex flex-col h-full min-h-0 bg-zinc-950">
      <div className="shrink-0 p-3 border-b border-zinc-800 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500 flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> API Documentation
        </p>

        {collections.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">
            Create a collection and add requests with descriptions to build docs.
          </p>
        ) : (
          <>
            <select
              value={selected?.id ?? ''}
              onChange={(e) => {
                const col = collections.find((c) => c.id === e.target.value);
                if (col) handleSelect(col);
              }}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
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
              placeholder="Base URL (optional, e.g. https://api.example.com)"
              className="text-xs"
            />
            <textarea
              value={collectionDesc}
              onChange={(e) => setCollectionDesc(e.target.value)}
              onBlur={() => void handleSaveDescription()}
              placeholder="Collection overview for published docs..."
              rows={2}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 resize-none focus:border-orange-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setShowPreview(true)}
                disabled={!html || requests.length === 0}
              >
                <Maximize2 className="h-3.5 w-3.5" /> Full preview
              </Button>
              <Button variant="secondary" size="sm" className="flex-1" onClick={handleExport} disabled={!html}>
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
            <p className="text-[10px] text-zinc-600">
              {requests.length} endpoint{requests.length !== 1 ? 's' : ''} · Edit per-request docs in Request → Docs tab
            </p>
          </>
        )}
      </div>

      {collections.length > 0 && selected && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-zinc-800 text-[10px] uppercase text-zinc-500">
            Endpoints
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
            {requests.length === 0 ? (
              <p className="text-xs text-zinc-500 p-3 text-center">No requests in this collection</p>
            ) : (
              requests.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => setFocusedRequestId(req.id === focusedRequestId ? null : req.id)}
                  className={cn(
                    'w-full text-left rounded-lg border p-2 transition-colors',
                    focusedRequestId === req.id
                      ? 'border-orange-500/50 bg-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn('text-[10px] font-bold font-mono shrink-0', methodColor(req.method))}>
                      {req.method}
                    </span>
                    <span className="text-xs text-zinc-200 truncate">{req.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">{req.url || 'No URL'}</p>
                </button>
              ))
            )}
          </div>

          {focusedRequest && (
            <div className="shrink-0 max-h-[45%] overflow-y-auto border-t border-zinc-800 p-3 space-y-2 bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                <span className="text-xs font-medium text-zinc-200 truncate">{focusedRequest.name}</span>
              </div>
              {focusedRequest.description ? (
                <p className="text-xs text-zinc-400 leading-relaxed">{focusedRequest.description}</p>
              ) : (
                <p className="text-xs text-zinc-600 italic">No description — add one in Request → Docs tab</p>
              )}
              {focusedRequest.exampleResponse && (
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 rounded p-2 overflow-x-auto max-h-24">
                  {focusedRequest.exampleResponse}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={`${selected?.name ?? 'API'} — Documentation`}
        size="full"
      >
        {html ? (
          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
            <iframe
              title="API Documentation full preview"
              srcDoc={html}
              className="w-full h-full min-h-0 min-w-0 flex-1 border-0 bg-zinc-950 block"
              sandbox="allow-same-origin"
            />
          </div>
        ) : (
          <p className="p-8 text-center text-zinc-500">No documentation to preview</p>
        )}
      </Modal>
    </div>
  );
}
