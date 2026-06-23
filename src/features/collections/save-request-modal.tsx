'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { collectionService, requestService } from '@/services/ipc';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTabsStore } from '@/stores/tabs-store';
import { showError, showSuccess } from '@/stores/toast-store';
import type { ApiRequest } from '@/types';

interface SaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  tabId: string | null;
  request: ApiRequest | null;
}

export function SaveRequestModal({ open, onClose, tabId, request }: SaveRequestModalProps) {
  const [name, setName] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [createNew, setCreateNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);
  const user = useAuthStore((s) => s.user);
  const updateTabRequest = useTabsStore((s) => s.updateTabRequest);
  const queryClient = useQueryClient();

  const { data: collections = [] } = useQuery({
    queryKey: ['collections', activeProjectId],
    queryFn: () => collectionService.getAll(activeProjectId ?? undefined),
    enabled: open,
  });

  useEffect(() => {
    if (open && request) {
      setName(request.name || 'Untitled Request');
      setCollectionId(request.collectionId ?? collections[0]?.id ?? '');
      setCreateNew(collections.length === 0);
      setNewCollectionName('');
    }
  }, [open, request, collections]);

  const handleSave = async () => {
    if (!request || !tabId) return;
    const finalName = name.trim() || 'Untitled Request';
    setSaving(true);
    try {
      let targetCollectionId = collectionId;

      if (createNew) {
        if (!newCollectionName.trim()) {
          showError('Collection name is required');
          setSaving(false);
          return;
        }
        const col = await collectionService.create(
          newCollectionName.trim(),
          undefined,
          activeProjectId ?? undefined,
          user?.id,
          undefined
        );
        targetCollectionId = col.id;
      } else if (!targetCollectionId) {
        showError('Select a collection or create a new one');
        setSaving(false);
        return;
      }

      const saved = await requestService.save({
        ...request,
        name: finalName,
        collectionId: targetCollectionId,
        updatedAt: new Date().toISOString(),
      });

      updateTabRequest(tabId, { name: saved.name, collectionId: saved.collectionId });
      void queryClient.invalidateQueries({ queryKey: ['collections'] });
      void queryClient.invalidateQueries({ queryKey: ['requests', targetCollectionId] });
      showSuccess('Request saved to collection');
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Save request">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Request name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Request name" />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={createNew ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => setCreateNew(false)}
          >
            Existing collection
          </Button>
          <Button
            type="button"
            variant={createNew ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setCreateNew(true)}
          >
            New collection
          </Button>
        </div>

        {createNew ? (
          <div>
            <label className="mb-1 block text-xs text-zinc-400">New collection name</label>
            <Input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="My Collection"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Collection</label>
            {collections.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No collections in this workspace. Create a new collection above.
              </p>
            ) : (
              <Select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full text-sm"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
