'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { projectService } from '@/services/auth';
import { showError, showSuccess } from '@/stores/toast-store';
import { FolderKanban, Plus, Settings } from 'lucide-react';

interface ProjectSelectorProps {
  onOpenSettings?: () => void;
}

export function ProjectSelector({ onOpenSettings }: ProjectSelectorProps) {
  const { projects, activeProjectId, setActiveProject, setProjects } = useWorkspaceStore();
  const user = useAuthStore((s) => s.user);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (name: string) => projectService.create(name, user!.id),
    onSuccess: (project) => {
      setProjects([project, ...projects]);
      setActiveProject(project.id);
      void queryClient.invalidateQueries({ queryKey: ['collections'] });
      showSuccess('Workspace created');
      setShowCreate(false);
      setNewName('');
    },
    onError: (e: Error) => showError(e.message),
  });

  if (!user) return null;

  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <>
      <div className="flex items-center gap-1.5 ml-2">
        <FolderKanban className="h-3.5 w-3.5 text-zinc-500" />
        <Select
          value={activeProjectId ?? ''}
          onChange={(e) => {
            setActiveProject(e.target.value);
            void queryClient.invalidateQueries({ queryKey: ['collections'] });
          }}
          className="text-xs h-7 max-w-[180px]"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.isPersonal ? ' (Personal)' : ''}
            </option>
          ))}
        </Select>
        <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)} title="New workspace">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        {activeProject && onOpenSettings && (
          <Button variant="ghost" size="sm" onClick={onOpenSettings} title="Workspace settings">
            <Settings className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New workspace">
        <div className="space-y-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Workspace name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName.trim());
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
              disabled={createMutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
