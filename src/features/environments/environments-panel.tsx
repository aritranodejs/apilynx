'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { environmentService } from '@/services/ipc';
import { useEnvironmentStore } from '@/stores/environment-store';
import { showError, showSuccess } from '@/stores/toast-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { KeyValueEditor } from '@/components/ui/key-value-editor';
import { createEmptyKeyValue } from '@/lib/utils';
import { maskSecret } from '@/lib/security';
import { Globe, Plus, Save, Trash2 } from 'lucide-react';
import type { EnvironmentVariable } from '@/types';

export function EnvironmentsPanel() {
  const [newName, setNewName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localVariables, setLocalVariables] = useState<EnvironmentVariable[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const queryClient = useQueryClient();
  const setEnvironments = useEnvironmentStore((s) => s.setEnvironments);
  const setActiveEnvironment = useEnvironmentStore((s) => s.setActiveEnvironment);
  const activeEnvironmentId = useEnvironmentStore((s) => s.activeEnvironmentId);

  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: async () => {
      const envs = await environmentService.getAll();
      setEnvironments(envs);
      return envs;
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => environmentService.create(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['environments'] });
      showSuccess('Environment created');
    },
    onError: (e: Error) => showError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: EnvironmentVariable[] }) =>
      environmentService.update(id, { variables }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['environments'] });
      setIsDirty(false);
      showSuccess('Environment saved');
    },
    onError: (e: Error) => showError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => environmentService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['environments'] });
      showSuccess('Environment deleted');
    },
    onError: (e: Error) => showError(e.message),
  });

  const selected = environments.find((e) => e.id === (selectedId ?? activeEnvironmentId));

  useEffect(() => {
    if (selected) {
      setLocalVariables(
        selected.variables.length > 0 ? selected.variables : [{ ...createEmptyKeyValue(), secret: false }]
      );
      setIsDirty(false);
    }
  }, [selected?.id, selected?.updatedAt]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate(newName.trim());
    setNewName('');
  };

  const handleSave = () => {
    if (!selected) return;
    updateMutation.mutate({ id: selected.id, variables: localVariables });
  };

  const handleVariablesChange = (pairs: import('@/types').KeyValuePair[]) => {
    setLocalVariables(
      pairs.map((p) => ({
        ...p,
        secret: localVariables.find((v) => v.id === p.id)?.secret ?? false,
      }))
    );
    setIsDirty(true);
  };

  const toggleSecret = (varId: string) => {
    setLocalVariables((vars) =>
      vars.map((v) => (v.id === varId ? { ...v, secret: !v.secret } : v))
    );
    setIsDirty(true);
  };

  const addVariable = () => {
    setLocalVariables((vars) => [...vars, { ...createEmptyKeyValue(), secret: false }]);
    setIsDirty(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b af-border space-y-2">
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New environment..."
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="text-xs"
          />
          <Button variant="ghost" size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-36 border-r af-border overflow-auto shrink-0">
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => {
                setSelectedId(env.id);
                setActiveEnvironment(env.id);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left ${
                (selectedId ?? activeEnvironmentId) === env.id
                  ? 'bg-[var(--bg-tertiary)] text-[var(--accent)]'
                  : 'af-text-muted hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{env.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-3">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">{selected.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={!isDirty || updateMutation.isPending}
                  >
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                    onClick={() => deleteMutation.mutate(selected.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <KeyValueEditor
                pairs={localVariables}
                onChange={handleVariablesChange}
                keyPlaceholder="Variable"
                valuePlaceholder="Value"
              />
              <div className="mt-3 space-y-1">
                {localVariables.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 text-xs af-text-muted">
                    <Checkbox
                      checked={v.secret}
                      onChange={() => toggleSecret(v.id)}
                      label="Secret"
                    />
                    {v.secret && v.value && (
                      <span className="font-mono">{maskSecret(v.value)}</span>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={addVariable} className="mt-2">
                <Plus className="h-3.5 w-3.5" /> Add Variable
              </Button>
            </>
          ) : (
            <div className="text-sm af-text-muted p-4">Select an environment</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EnvironmentSelector() {
  const environments = useEnvironmentStore((s) => s.environments);
  const activeEnvironmentId = useEnvironmentStore((s) => s.activeEnvironmentId);
  const setActiveEnvironment = useEnvironmentStore((s) => s.setActiveEnvironment);

  if (environments.length === 0) return null;

  return (
    <select
      value={activeEnvironmentId ?? ''}
      onChange={(e) => setActiveEnvironment(e.target.value)}
      className="rounded-md border af-border af-input px-2 py-1 text-xs focus:border-[var(--accent)] focus:outline-none"
    >
      {environments.map((env) => (
        <option key={env.id} value={env.id}>
          {env.name}
        </option>
      ))}
    </select>
  );
}
