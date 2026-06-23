'use client';

import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { historyService } from '@/services/ipc';
import { useTabsStore } from '@/stores/tabs-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDuration, getStatusColor, methodColor } from '@/lib/utils';
import { Trash2, RotateCcw, Search } from 'lucide-react';
import type { HistoryEntry } from '@/types';

export function HistoryPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const queryClient = useQueryClient();
  const addTab = useTabsStore((s) => s.addTab);
  const parentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['history', page, search],
    queryFn: () => historyService.get(page, 50, search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => historyService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });

  const clearMutation = useMutation({
    mutationFn: () => historyService.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });

  const items = data?.items ?? [];

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const restore = useCallback(
    (entry: HistoryEntry) => {
      addTab(structuredClone(entry.requestSnapshot));
    },
    [addTab]
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <div className="flex gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search history..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="text-xs"
          />
          <Button variant="ghost" size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-400"
          onClick={() => clearMutation.mutate()}
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear All
        </Button>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto">
        {isLoading && <div className="p-4 text-sm text-zinc-500">Loading...</div>}
        {!isLoading && items.length === 0 && (
          <div className="p-4 text-sm text-zinc-500">No history yet</div>
        )}
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const entry = items[virtualRow.index];
            return (
              <div
                key={entry.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b border-zinc-800/50 px-3 py-2 hover:bg-zinc-800/50 group"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${methodColor(entry.method)}`}>
                    {entry.method}
                  </span>
                  <span className={`text-xs ${getStatusColor(entry.status)}`}>{entry.status}</span>
                  <span className="text-xs text-zinc-600 ml-auto">{formatDuration(entry.duration)}</span>
                </div>
                <div className="text-xs text-zinc-400 truncate mt-0.5">{entry.url}</div>
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => restore(entry)} className="!px-1 !py-0.5">
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="!px-1 !py-0.5 text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between p-2 border-t border-zinc-800 text-xs text-zinc-500">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span>
            {page} / {data.totalPages} ({data.total} items)
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
