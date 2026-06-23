'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { projectService, teamService } from '@/services/auth';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { showError, showSuccess } from '@/stores/toast-store';
import type { ProjectMember, TeamRole } from '@/types/auth';
import { Users, Trash2, UserPlus, Mail } from 'lucide-react';

interface WorkspaceModalProps {
  open: boolean;
  onClose: () => void;
}

const ROLES: { value: TeamRole; label: string; desc: string }[] = [
  { value: 'admin', label: 'Admin', desc: 'Manage members & collections' },
  { value: 'member', label: 'Member', desc: 'Create & edit requests' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access' },
];

export function WorkspaceModal({ open, onClose }: WorkspaceModalProps) {
  const user = useAuthStore((s) => s.user);
  const { projects, activeProjectId, setProjects, setActiveProject } = useWorkspaceStore();
  const project = projects.find((p) => p.id === activeProjectId);
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [selectedTeamId, setSelectedTeamId] = useState(project?.teamId ?? '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && project) {
      setName(project.name);
      setDescription(project.description ?? '');
      setSelectedTeamId(project.teamId ?? '');
      setInviteEmail('');
      setInviteRole('member');
    }
  }, [open, project]);

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: () => teamService.getAll(user!.id),
    enabled: !!user && open,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['project-members', project?.id],
    queryFn: () => projectService.getMembers(project!.id),
    enabled: !!project && open,
  });

  const linkedTeam = teams.find((t) => t.id === project?.teamId);
  const isOwner = project?.ownerId === user?.id;

  const updateMutation = useMutation({
    mutationFn: () =>
      projectService.update(project!.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: (updated) => {
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
      showSuccess('Workspace updated');
    },
    onError: (e: Error) => showError(e.message),
  });

  const inviteMemberMutation = useMutation({
    mutationFn: () => projectService.addMember(project!.id, inviteEmail.trim(), inviteRole),
    onSuccess: (member) => {
      void queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] });
      setInviteEmail('');
      if (member.status === 'invited') {
        showSuccess(
          `Invitation sent to ${member.email}. They must accept to join.`
        );
      } else {
        showSuccess(`${member.name} added to workspace`);
      }
    },
    onError: (e: Error) => showError(e.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => projectService.removeMember(project!.id, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] });
      showSuccess('Member removed');
    },
    onError: (e: Error) => showError(e.message),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: TeamRole }) =>
      projectService.updateMemberRole(project!.id, memberId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] });
      showSuccess('Role updated');
    },
    onError: (e: Error) => showError(e.message),
  });

  const inviteTeamMutation = useMutation({
    mutationFn: (teamId: string) => projectService.inviteTeam(project!.id, teamId),
    onSuccess: (updated) => {
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedTeamId(updated.teamId ?? '');
      showSuccess('Team linked — all team members now have access');
    },
    onError: (e: Error) => showError(e.message),
  });

  const removeTeamMutation = useMutation({
    mutationFn: () => projectService.update(project!.id, { teamId: null }),
    onSuccess: (updated) => {
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedTeamId('');
      showSuccess('Team unlinked from workspace');
    },
    onError: (e: Error) => showError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectService.delete(project!.id),
    onSuccess: () => {
      const remaining = projects.filter((p) => p.id !== project!.id);
      setProjects(remaining);
      setActiveProject(remaining[0]?.id ?? null);
      showSuccess('Workspace deleted');
      onClose();
    },
    onError: (e: Error) => showError(e.message),
  });

  if (!user || !project) return null;

  return (
    <Modal open={open} onClose={onClose} title="Workspace settings" className="max-w-xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Workspace name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={project.isPersonal}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this workspace for?"
          />
        </div>

        {!project.isPersonal && isOwner && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              Save changes
            </Button>
          </div>
        )}

        {/* Direct member invites */}
        <div className="border-t border-zinc-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Workspace members
            </h3>
            <span className="text-[10px] text-zinc-600">{members.length} members · unlimited</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Invite by email. They receive an invitation and must Accept or Decline — like Postman.
          </p>

          <div className="space-y-1 max-h-40 overflow-y-auto rounded border border-zinc-800 p-2">
            {members.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-2">No members yet</p>
            ) : (
              members.map((m: ProjectMember) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 text-xs px-1 py-1.5 rounded hover:bg-zinc-800/40"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-200">{m.name}</span>
                    <span className="text-zinc-500 ml-2 truncate">{m.email}</span>
                  </div>
                  {m.status === 'invited' ? (
                    <span className="text-[10px] uppercase text-amber-400/90 shrink-0">
                      Awaiting accept
                    </span>
                  ) : m.role === 'owner' ? (
                    <span className="text-[10px] uppercase text-orange-400/80 shrink-0">Owner</span>
                  ) : isOwner ? (
                    <>
                      <Select
                        value={m.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            memberId: m.id,
                            role: e.target.value as TeamRole,
                          })
                        }
                        className="text-[10px] h-6 w-24"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!p-0.5 text-red-400 shrink-0"
                        onClick={() => removeMemberMutation.mutate(m.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-[10px] capitalize text-zinc-600 shrink-0">{m.role}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {isOwner && (
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> Invite member
              </p>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                type="email"
                className="text-sm"
              />
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="w-full text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </Select>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!inviteEmail.trim() || inviteMemberMutation.isPending}
                onClick={() => inviteMemberMutation.mutate()}
              >
                <Mail className="h-3.5 w-3.5" /> Send invite
              </Button>
            </div>
          )}
        </div>

        {/* Team bulk invite */}
        {isOwner && (
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <h3 className="text-xs font-medium text-zinc-300">Or invite entire team</h3>
            <p className="text-[11px] text-zinc-500">
              Link a team to give all its members access at once.
            </p>
            {linkedTeam ? (
              <div className="flex items-center justify-between p-2 rounded bg-zinc-800/50 text-sm">
                <span className="text-zinc-200">{linkedTeam.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() => removeTeamMutation.mutate()}
                >
                  Unlink team
                </Button>
              </div>
            ) : (
              <>
                <Select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full text-sm"
                >
                  <option value="">Select a team...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={!selectedTeamId || inviteTeamMutation.isPending}
                  onClick={() => selectedTeamId && inviteTeamMutation.mutate(selectedTeamId)}
                >
                  Link team to workspace
                </Button>
              </>
            )}
          </div>
        )}

        {!project.isPersonal && isOwner && (
          <div className="border-t border-zinc-800 pt-4">
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => {
                if (confirm('Delete this workspace?')) deleteMutation.mutate();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete workspace
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
