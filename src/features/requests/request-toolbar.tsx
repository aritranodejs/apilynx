'use client';

import { Save, Trash2, Copy, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ApiRequest } from '@/types';
import { cn } from '@/lib/utils';

interface RequestToolbarProps {
  request: ApiRequest;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isSaved: boolean;
}

export function RequestToolbar({
  request,
  onNameChange,
  onSave,
  onDelete,
  onDuplicate,
  isSaved,
}: RequestToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/40 px-3 py-2 shrink-0">
      <Pencil className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      <Input
        value={request.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Request name"
        className="h-8 min-w-0 flex-1 text-sm font-medium sm:max-w-xs"
      />
      {isSaved && (
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-emerald-500/80">
          Saved
        </span>
      )}
      <div className="flex w-full items-center gap-1.5 sm:ml-auto sm:w-auto">
        <Button variant="primary" size="sm" onClick={onSave} title="Save to collection (Ctrl+S)">
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onDuplicate} title="Duplicate request">
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Duplicate</span>
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          title="Delete request"
          className={cn(!request.collectionId && 'opacity-60')}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  );
}
