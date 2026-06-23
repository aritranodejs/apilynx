'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService, requestService } from '@/services/ipc';
import { showError, showSuccess } from '@/stores/toast-store';
import { useTabsStore } from '@/stores/tabs-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ApiRequest, Collection, CollectionExport } from '@/types';
import {
  FolderOpen,
  Plus,
  Trash2,
  Download,
  Upload,
  FileJson,
  Pencil,
  Copy,
  Play,
  BookOpen,
  Braces,
} from 'lucide-react';
import { generateId } from '@/lib/utils';
import { importOpenApi, importPostmanCollection, exportOpenApi } from '@/lib/import-export';
import { downloadHtml, generateCollectionDocs } from '@/lib/docs-generator';
import { CollectionRunnerModal } from '@/features/collections/collection-runner-modal';

export function CollectionsPanel() {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [runnerCollection, setRunnerCollection] = useState<Collection | null>(null);
  const [runnerRequests, setRunnerRequests] = useState<ApiRequest[]>([]);
  const [showRunner, setShowRunner] = useState(false);
  const queryClient = useQueryClient();
  const addTab = useTabsStore((s) => s.addTab);
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);
  const user = useAuthStore((s) => s.user);

  const { data: collections = [] } = useQuery({
    queryKey: ['collections', activeProjectId, user?.id],
    queryFn: () => collectionService.getAll(activeProjectId ?? undefined),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      collectionService.create(name, undefined, activeProjectId ?? undefined, user?.id, undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['collections'] });
      showSuccess('Collection created');
    },
    onError: (e: Error) => showError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      collectionService.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setEditingId(null);
      showSuccess('Collection renamed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showSuccess('Collection deleted');
    },
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate(newName.trim());
    setNewName('');
  };

  const handleAddRequest = async (collectionId: string) => {
    const request = await requestService.createInCollection(collectionId);
    addTab(request);
    queryClient.invalidateQueries({ queryKey: ['collections'] });
  };

  const handleExport = async (collection: Collection) => {
    const requests = await requestService.getByCollection(collection.id);
    const exportData: CollectionExport = {
      version: 1,
      name: collection.name,
      description: collection.description,
      requests,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as Record<string, unknown>;
        if (data.info && data.item) {
          const { collection: colMeta, requests } = importPostmanCollection(
            data as Parameters<typeof importPostmanCollection>[0]
          );
          const collection = await collectionService.create(
            colMeta.name,
            colMeta.description,
            activeProjectId ?? undefined,
            user?.id
          );
          for (const req of requests) {
            await requestService.save({ ...req, id: generateId(), collectionId: collection.id });
          }
        } else if (data.openapi || data.swagger) {
          const { collection: colMeta, requests } = importOpenApi(
            data as Parameters<typeof importOpenApi>[0]
          );
          const collection = await collectionService.create(
            colMeta.name,
            colMeta.description,
            activeProjectId ?? undefined,
            user?.id
          );
          for (const req of requests) {
            await requestService.save({ ...req, id: generateId(), collectionId: collection.id });
          }
        } else {
          const exportData = data as unknown as CollectionExport;
          const collection = await collectionService.create(
            exportData.name,
            exportData.description,
            activeProjectId ?? undefined,
            user?.id
          );
          for (const req of exportData.requests) {
            await requestService.save({ ...req, id: generateId(), collectionId: collection.id });
          }
        }
        queryClient.invalidateQueries({ queryKey: ['collections'] });
        showSuccess('Collection imported');
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Import failed');
      }
    };
    input.click();
  };

  const handleRunCollection = async (collection: Collection) => {
    const requests = await requestService.getByCollection(collection.id);
    setRunnerCollection(collection);
    setRunnerRequests(requests);
    setShowRunner(true);
  };

  const handleExportOpenApi = async (collection: Collection) => {
    const requests = await requestService.getByCollection(collection.id);
    const spec = exportOpenApi(collection, requests);
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.replace(/\s+/g, '-').toLowerCase()}-openapi.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDocs = async (collection: Collection) => {
    const requests = await requestService.getByCollection(collection.id);
    const html = generateCollectionDocs(collection, requests);
    downloadHtml(`${collection.name.replace(/\s+/g, '-').toLowerCase()}-docs.html`, html);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-zinc-600">Collections</p>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New collection..."
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="text-xs"
          />
          <Button variant="secondary" size="sm" onClick={handleCreate} title="Create collection">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="w-full" onClick={handleImport}>
          <Upload className="h-3.5 w-3.5" /> Import (JSON / OpenAPI / Postman)
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {collections.map((col) => (
          <div key={col.id} className="border-b border-zinc-800/50">
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800/50 group">
              <FolderOpen className="h-4 w-4 text-orange-400 shrink-0" />
              {editingId === col.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => updateMutation.mutate({ id: col.id, name: editName })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateMutation.mutate({ id: col.id, name: editName });
                  }}
                  className="text-xs h-7"
                  autoFocus
                />
              ) : (
                <span
                  className="text-sm text-zinc-200 flex-1 truncate cursor-pointer"
                  onDoubleClick={() => {
                    setEditingId(col.id);
                    setEditName(col.name);
                  }}
                >
                  {col.name}
                </span>
              )}
              <div className="flex gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleAddRequest(col.id)}
                  className="!p-1"
                  title="Add request"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(col.id);
                    setEditName(col.name);
                  }}
                  className="!p-1"
                  title="Rename"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleRunCollection(col)}
                  className="!p-1"
                  title="Run collection"
                >
                  <Play className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleExportDocs(col)}
                  className="!p-1"
                  title="Export documentation"
                >
                  <BookOpen className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleExportOpenApi(col)}
                  className="!p-1"
                  title="Export OpenAPI"
                >
                  <Braces className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void handleExport(col)} className="!p-1" title="Export JSON">
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete collection "${col.name}"?`)) deleteMutation.mutate(col.id);
                  }}
                  className="!p-1 text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <CollectionRequests collectionId={col.id} />
          </div>
        ))}
        {collections.length === 0 && (
          <div className="p-4 text-sm text-zinc-500 text-center">
            <FileJson className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No collections yet
          </div>
        )}
      </div>

      <CollectionRunnerModal
        open={showRunner}
        onClose={() => setShowRunner(false)}
        collection={runnerCollection}
        requests={runnerRequests}
      />
    </div>
  );
}

function CollectionRequests({ collectionId }: { collectionId: string }) {
  const addTab = useTabsStore((s) => s.addTab);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: requests = [] } = useQuery({
    queryKey: ['requests', collectionId],
    queryFn: () => requestService.getByCollection(collectionId),
  });

  const handleRename = async (req: ApiRequest, newName: string) => {
    await requestService.save({ ...req, name: newName });
    void queryClient.invalidateQueries({ queryKey: ['requests', collectionId] });
    setEditingId(null);
    showSuccess('Request renamed');
  };

  const handleDelete = async (req: ApiRequest) => {
    if (!confirm(`Delete "${req.name}"?`)) return;
    await requestService.delete(req.id);
    void queryClient.invalidateQueries({ queryKey: ['requests', collectionId] });
    showSuccess('Request deleted');
  };

  const handleDuplicate = async (req: ApiRequest) => {
    const copy = await requestService.save({
      ...structuredClone(req),
      id: generateId(),
      name: `${req.name} (Copy)`,
      collectionId,
    });
    addTab(copy);
    void queryClient.invalidateQueries({ queryKey: ['requests', collectionId] });
    showSuccess('Request duplicated');
  };

  if (requests.length === 0) return null;

  return (
    <div className="pl-6 pb-1">
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-800/30 group rounded"
        >
          {editingId === req.id ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => void handleRename(req, editName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleRename(req, editName);
              }}
              className="text-xs h-6 flex-1"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => addTab(req)}
              className="flex-1 text-left text-xs text-zinc-400 hover:text-zinc-200 truncate"
            >
              <span className="text-orange-400/80 font-mono mr-1">{req.method}</span>
              {req.name}
            </button>
          )}
          <div className="flex gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="!p-0.5 h-6 w-6"
              title="Rename"
              onClick={() => {
                setEditingId(req.id);
                setEditName(req.name);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!p-0.5 h-6 w-6"
              title="Duplicate"
              onClick={() => void handleDuplicate(req)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!p-0.5 h-6 w-6 text-red-400"
              title="Delete"
              onClick={() => void handleDelete(req)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
