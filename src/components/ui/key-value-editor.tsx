'use client';

import { memo } from 'react';
import type { KeyValuePair } from '@/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { createEmptyKeyValue } from '@/lib/utils';

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  suggestions?: { key: string; value: string }[];
}

export const KeyValueEditor = memo(function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  suggestions = [],
}: KeyValueEditorProps) {
  const updatePair = (id: string, field: keyof KeyValuePair, value: string | boolean) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addRow = () => onChange([...pairs, createEmptyKeyValue()]);

  const removeRow = (id: string) => {
    if (pairs.length <= 1) {
      onChange([createEmptyKeyValue()]);
    } else {
      onChange(pairs.filter((p) => p.id !== id));
    }
  };

  const applySuggestion = (id: string, key: string, value: string) => {
    updatePair(id, 'key', key);
    updatePair(id, 'value', value);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[24px_1fr_1fr_32px] gap-2 text-xs font-medium text-zinc-500 px-1">
        <span />
        <span>{keyPlaceholder}</span>
        <span>{valuePlaceholder}</span>
        <span />
      </div>
      {pairs.map((pair) => (
        <div key={pair.id} className="grid grid-cols-[24px_1fr_1fr_32px] gap-2 items-center">
          <Checkbox
            checked={pair.enabled}
            onChange={(v) => updatePair(pair.id, 'enabled', v)}
          />
          <Input
            value={pair.key}
            onChange={(e) => updatePair(pair.id, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            list={suggestions.length > 0 ? 'kv-suggestions' : undefined}
            className={!pair.enabled ? 'opacity-50' : ''}
          />
          <Input
            value={pair.value}
            onChange={(e) => updatePair(pair.id, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className={!pair.enabled ? 'opacity-50' : ''}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeRow(pair.id)}
            className="!p-1 text-zinc-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {suggestions.length > 0 && (
        <datalist id="kv-suggestions">
          {suggestions.map((s) => (
            <option key={s.key} value={s.key}>
              {s.value}
            </option>
          ))}
        </datalist>
      )}
      <Button variant="ghost" size="sm" onClick={addRow} className="mt-2">
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
});
