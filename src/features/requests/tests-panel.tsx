'use client';

import type { RequestTest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { generateId } from '@/lib/utils';
import { createDefaultTests } from '@/lib/collection-runner';
import { Plus, Trash2 } from 'lucide-react';

interface TestsPanelProps {
  tests: RequestTest[] | undefined;
  onChange: (tests: RequestTest[]) => void;
}

export function TestsPanel({ tests = [], onChange }: TestsPanelProps) {
  const addTest = () => {
    onChange([
      ...tests,
      {
        id: generateId(),
        name: 'New test',
        type: 'status',
        expected: '200',
        enabled: true,
      },
    ]);
  };

  const addDefaults = () => {
    onChange([...tests, ...createDefaultTests()]);
  };

  const update = (id: string, partial: Partial<RequestTest>) => {
    onChange(tests.map((t) => (t.id === id ? { ...t, ...partial } : t)));
  };

  const remove = (id: string) => onChange(tests.filter((t) => t.id !== id));

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Automated tests run after Send and in Collection Runner (Postman-style).
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={addDefaults}>
            Add defaults
          </Button>
          <Button variant="secondary" size="sm" onClick={addTest}>
            <Plus className="h-3.5 w-3.5" /> Add test
          </Button>
        </div>
      </div>

      {tests.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-8">No tests yet. Add status, body, or timing checks.</p>
      )}

      {tests.map((test) => (
        <div
          key={test.id}
          className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50"
        >
          <input
            type="checkbox"
            checked={test.enabled}
            onChange={(e) => update(test.id, { enabled: e.target.checked })}
            className="accent-orange-500"
          />
          <Input
            value={test.name}
            onChange={(e) => update(test.id, { name: e.target.value })}
            placeholder="Test name"
            className="flex-1 min-w-[120px] text-xs"
          />
          <Select
            value={test.type}
            onChange={(e) => update(test.id, { type: e.target.value as RequestTest['type'] })}
            className="w-36 text-xs"
          >
            <option value="status">Status code</option>
            <option value="body_contains">Body contains</option>
            <option value="response_time">Max time (ms)</option>
          </Select>
          <Input
            value={test.expected}
            onChange={(e) => update(test.id, { expected: e.target.value })}
            placeholder={test.type === 'response_time' ? '500' : '200'}
            className="w-32 text-xs font-mono"
          />
          <Button variant="ghost" size="sm" onClick={() => remove(test.id)} className="text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
