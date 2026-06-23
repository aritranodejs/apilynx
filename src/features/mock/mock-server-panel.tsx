'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collectionService, requestService, mockServerService, isElectronApp } from '@/services/ipc';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/stores/toast-store';
import { Server, Square } from 'lucide-react';

export function MockServerPanel() {
  const [port, setPort] = useState(4010);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ running: boolean; port: number }>({ running: false, port: 0 });
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);
  const user = useAuthStore((s) => s.user);
  const isElectron = isElectronApp();

  const { data: collections = [] } = useQuery({
    queryKey: ['collections', activeProjectId, user?.id],
    queryFn: () => collectionService.getAll(activeProjectId ?? undefined),
  });

  const collectionId = selectedCollectionId ?? collections[0]?.id;

  const { data: requests = [] } = useQuery({
    queryKey: ['requests', collectionId],
    queryFn: () => requestService.getByCollection(collectionId!),
    enabled: !!collectionId,
  });

  const mockableRequests = useMemo(
    () => requests.filter((r) => r.exampleResponse?.trim()),
    [requests]
  );

  useEffect(() => {
    if (isElectron) {
      void mockServerService.getStatus().then(setStatus).catch(() => {});
    }
  }, [isElectron]);

  const handleStart = async () => {
    if (!collectionId) return;
    if (mockableRequests.length === 0) {
      showError('No example responses in this collection. Add them on each request\'s Docs tab.');
      return;
    }
    try {
      const routes = mockableRequests.map((r) => ({
        method: r.method,
        path: r.url.split('?')[0] || '/',
        status: 200,
        body: r.exampleResponse!.trim(),
        contentType: 'application/json',
      }));
      const actualPort = await mockServerService.start(port, routes);
      setStatus({ running: true, port: actualPort });
      showSuccess(`Mock server running — ${routes.length} route(s) at http://127.0.0.1:${actualPort}`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to start mock server');
    }
  };

  const handleStop = async () => {
    await mockServerService.stop();
    setStatus({ running: false, port: 0 });
    showSuccess('Mock server stopped');
  };

  if (!isElectron) {
    return (
      <div className="p-4 text-sm text-zinc-500">
        Mock server requires the Apilynx desktop app (Electron).
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3 space-y-3">
      <p className="text-[10px] uppercase tracking-wide text-zinc-600 flex items-center gap-1">
        <Server className="h-3 w-3" /> Mock Server
      </p>
      <p className="text-xs text-zinc-500 leading-relaxed">
        Serves only requests that have an <strong className="text-zinc-400">Example response</strong> saved
        (Request → Docs tab). No placeholder data.
      </p>
      <select
        value={collectionId ?? ''}
        onChange={(e) => setSelectedCollectionId(e.target.value)}
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 text-xs px-2 py-2 text-zinc-100"
      >
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-zinc-500">
        {mockableRequests.length} of {requests.length} request(s) have example responses
      </p>
      <Input
        type="number"
        value={port}
        onChange={(e) => setPort(parseInt(e.target.value, 10) || 4010)}
        placeholder="Port"
        className="text-xs"
        disabled={status.running}
      />
      {status.running ? (
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-mono break-all">http://127.0.0.1:{status.port}</p>
          <Button variant="danger" size="sm" className="w-full" onClick={() => void handleStop()}>
            <Square className="h-3.5 w-3.5" /> Stop server
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => void handleStart()}
          disabled={!collectionId || mockableRequests.length === 0}
        >
          <Server className="h-3.5 w-3.5" /> Start mock server
        </Button>
      )}
    </div>
  );
}
