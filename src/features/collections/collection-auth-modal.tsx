'use client';

import { useEffect, useState } from 'react';
import type { AuthConfig, Collection } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AuthEditor } from '@/features/auth/auth-editor';
import { collectionService } from '@/services/ipc';
import { showError, showSuccess } from '@/stores/toast-store';

interface CollectionAuthModalProps {
  open: boolean;
  collection: Collection | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function CollectionAuthModal({
  open,
  collection,
  onClose,
  onSaved,
}: CollectionAuthModalProps) {
  const [auth, setAuth] = useState<AuthConfig>({ type: 'none' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (collection) {
      setAuth(collection.auth ?? { type: 'none' });
    }
  }, [collection?.id, collection?.auth, collection?.updatedAt]);

  const handleSave = async () => {
    if (!collection) return;
    setSaving(true);
    try {
      await collectionService.update(collection.id, { auth });
      showSuccess('Collection auth saved');
      onSaved?.();
      onClose();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to save collection auth');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Collection Auth — ${collection?.name ?? ''}`}>
      <p className="text-sm text-zinc-400 mb-2">
        Auth set here applies to every request in this collection that uses{' '}
        <span className="text-orange-400">Inherit from parent</span>.
      </p>
      <AuthEditor auth={auth} onChange={setAuth} />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => void handleSave()} disabled={saving}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
