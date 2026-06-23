'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { environmentService } from '@/services/ipc';
import { useEnvironmentStore } from '@/stores/environment-store';
import { showError, showSuccess } from '@/stores/toast-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { createEmptyKeyValue } from '@/lib/utils';
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
    onSuccess: (env) => {
      void queryClient.invalidateQueries({ queryKey: ['environments'] });
      setSelectedId(env.id);
      setActiveEnvironment(env.id);
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
      setSelectedId(null);
      showSuccess('Environment deleted');
    },
    onError: (e: Error) => showError(e.message),
  });

  const activeId = selectedId ?? activeEnvironmentId ?? environments[0]?.id ?? null;
  const selected = environments.find((e) => e.id === activeId);

  useEffect(() => {
    if (environments.length > 0 && !activeId) {
      setSelectedId(environments[0].id);
      setActiveEnvironment(environments[0].id);
    }
  }, [environments, activeId, setActiveEnvironment]);

  useEffect(() => {
    if (selected) {
      setLocalVariables(
        selected.variables.length > 0
          ? selected.variables
          : [{ ...createEmptyKeyValue(), secret: false }]
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
    const cleaned = localVariables.filter((v) => v.key.trim() || v.value.trim());
    updateMutation.mutate({
      id: selected.id,
      variables: cleaned.length > 0 ? cleaned : [{ ...createEmptyKeyValue(), secret: false }],
    });
  };

  const updateVariable = (id: string, patch: Partial<EnvironmentVariable>) => {
    setLocalVariables((vars) => vars.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    setIsDirty(true);
  };

  const addVariable = () => {
    setLocalVariables((vars) => [...vars, { ...createEmptyKeyValue(), secret: false }]);
    setIsDirty(true);
  };

  const removeVariable = (id: string) => {
    setLocalVariables((vars) => {
      if (vars.length <= 1) return [{ ...createEmptyKeyValue(), secret: false }];
      return vars.filter((v) => v.id !== id);
    });
    setIsDirty(true);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-zinc-950">
      <div className="shrink-0 p-3 border-b border-zinc-800 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500 flex items-center gap-1">
          <Globe className="h-3 w-3" /> Environments
        </p>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New environment name..."
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="text-xs flex-1 min-w-0"
          />
          <Button variant="secondary" size="sm" onClick={handleCreate} title="Create environment">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {environments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="text-sm text-zinc-500">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No environments yet.
            <br />
            Create one above to use <code className="text-orange-400">{'{{variables}}'}</code> in requests.
          </div>
        </div>
      ) : (
        <>
          <div className="shrink-0 p-3 border-b border-zinc-800">
            <label className="text-[10px] uppercase text-zinc-500 mb-1 block">Active environment</label>
            <select
              value={activeId ?? ''}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setActiveEnvironment(e.target.value);
              }}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
            >
              {environments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {selected && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-zinc-200 truncate">{selected.name}</h3>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={!isDirty || updateMutation.isPending}
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => {
                        if (confirm(`Delete "${selected.name}"?`)) deleteMutation.mutate(selected.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500">
                  Use <code className="text-orange-400/90">{'{{KEY}}'}</code> in URLs, headers, and body.
                </p>

                {localVariables.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={v.enabled}
                        onChange={(checked) => updateVariable(v.id, { enabled: checked })}
                      />
                      <span className="text-[10px] text-zinc-500 uppercase">Enabled</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!p-1 ml-auto text-zinc-500 hover:text-red-400"
                        onClick={() => removeVariable(v.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input
                      value={v.key}
                      onChange={(e) => updateVariable(v.id, { key: e.target.value })}
                      placeholder="Variable name"
                      className="text-xs font-mono"
                    />
                    <Input
                      value={v.value}
                      onChange={(e) => updateVariable(v.id, { value: e.target.value })}
                      placeholder="Value"
                      className="text-xs font-mono"
                      type={v.secret ? 'password' : 'text'}
                    />
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.secret}
                        onChange={(e) => updateVariable(v.id, { secret: e.target.checked })}
                        className="accent-orange-500"
                      />
                      Secret (masked in UI)
                    </label>
                  </div>
                ))}

                <Button variant="ghost" size="sm" onClick={addVariable} className="w-full border border-dashed border-zinc-700">
                  <Plus className="h-3.5 w-3.5" /> Add variable
                </Button>
              </>
            )}
          </div>
        </>
      )}
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
      value={activeEnvironmentId ?? environments[0]?.id ?? ''}
      onChange={(e) => setActiveEnvironment(e.target.value)}
      className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none max-w-[160px] truncate"
      title="Active environment"
    >
      {environments.map((env) => (
        <option key={env.id} value={env.id}>
          {env.name}
        </option>
      ))}
    </select>
  );
}
