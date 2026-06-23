'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { inviteService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { showError, showSuccess } from '@/stores/toast-store';
import { projectService } from '@/services/auth';
import { Mail, Check, X } from 'lucide-react';

interface InvitationsModalProps {
  open: boolean;
  onClose: () => void;
}

export function InvitationsModal({ open, onClose }: InvitationsModalProps) {
  const user = useAuthStore((s) => s.user);
  const setProjects = useWorkspaceStore((s) => s.setProjects);
  const queryClient = useQueryClient();

  const { data: projectInvites = [] } = useQuery({
    queryKey: ['project-invites', user?.email],
    queryFn: () => inviteService.getPendingProjects(user!.email),
    enabled: !!user && open,
  });

  const { data: teamInvites = [] } = useQuery({
    queryKey: ['team-invites', user?.email],
    queryFn: () => inviteService.getPendingTeams(user!.email),
    enabled: !!user && open,
  });

  const acceptProject = useMutation({
    mutationFn: (memberId: string) =>
      inviteService.acceptProject(memberId, user!.id, user!.email),
    onSuccess: async () => {
      const projects = await projectService.getAll(user!.id);
      setProjects(projects);
      void queryClient.invalidateQueries({ queryKey: ['project-invites'] });
      showSuccess('Workspace invitation accepted');
    },
    onError: (e: Error) => showError(e.message),
  });

  const declineProject = useMutation({
    mutationFn: (memberId: string) =>
      inviteService.declineProject(memberId, user!.id, user!.email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project-invites'] });
      showSuccess('Workspace invitation declined');
    },
    onError: (e: Error) => showError(e.message),
  });

  const acceptTeam = useMutation({
    mutationFn: (memberId: string) => inviteService.acceptTeam(memberId, user!.id, user!.email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      showSuccess('Team invitation accepted');
    },
    onError: (e: Error) => showError(e.message),
  });

  const declineTeam = useMutation({
    mutationFn: (memberId: string) => inviteService.declineTeam(memberId, user!.id, user!.email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      showSuccess('Team invitation declined');
    },
    onError: (e: Error) => showError(e.message),
  });

  if (!user) return null;

  const total = projectInvites.length + teamInvites.length;

  return (
    <Modal open={open} onClose={onClose} title="Invitations" className="max-w-lg">
      {total === 0 ? (
        <div className="py-8 text-center text-sm text-zinc-500">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
          No pending invitations
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {projectInvites.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-zinc-400 mb-2">Workspace invites</h3>
              {projectInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 p-3 mb-2"
                >
                  <div>
                    <p className="text-sm text-zinc-200">{inv.projectName}</p>
                    <p className="text-xs text-zinc-500 capitalize">Role: {inv.role}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptProject.mutate(inv.id)}
                      title="Accept"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => declineProject.mutate(inv.id)}
                      title="Decline"
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {teamInvites.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-zinc-400 mb-2">Team invites</h3>
              {teamInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 p-3 mb-2"
                >
                  <div>
                    <p className="text-sm text-zinc-200">{inv.teamName}</p>
                    <p className="text-xs text-zinc-500 capitalize">Role: {inv.role}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptTeam.mutate(inv.id)}
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => declineTeam.mutate(inv.id)}
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
