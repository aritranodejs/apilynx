'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { showError, showSuccess } from '@/stores/toast-store';
import type { Team, TeamMember, TeamRole } from '@/types/auth';
import { Users, Plus, UserPlus, Trash2 } from 'lucide-react';

export function TeamsPanel() {
  const user = useAuthStore((s) => s.user);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: () => teamService.getAll(user!.id),
    enabled: !!user,
  });

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? teams[0];

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', selectedTeam?.id],
    queryFn: () => teamService.getMembers(selectedTeam!.id),
    enabled: !!selectedTeam,
  });

  const createTeamMutation = useMutation({
    mutationFn: (name: string) =>
      teamService.create(name, user!.id, user!.email, user!.name),
    onSuccess: (team) => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      setSelectedTeamId(team.id);
      setNewTeamName('');
      showSuccess('Team created');
    },
    onError: (e: Error) => showError(e.message),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, email, role }: { teamId: string; email: string; role: TeamRole }) =>
      teamService.addMember(teamId, email, role),
    onSuccess: (member) => {
      void queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setInviteEmail('');
      if (member.status === 'invited') {
        showSuccess(`Invitation sent to ${member.email}. They must accept to join.`);
      } else {
        showSuccess(`${member.name} added to team`);
      }
    },
    onError: (e: Error) => showError(e.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      teamService.removeMember(teamId, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members'] });
      showSuccess('Member removed');
    },
    onError: (e: Error) => showError(e.message),
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-sm text-zinc-500">
        <Users className="h-8 w-8 mb-2 opacity-50" />
        Sign in to manage teams
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <div className="flex gap-2">
          <Input
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="New team name..."
            className="text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTeamName.trim()) {
                createTeamMutation.mutate(newTeamName.trim());
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => newTeamName.trim() && createTeamMutation.mutate(newTeamName.trim())}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {teams.length === 0 ? (
          <div className="p-4 text-sm text-zinc-500 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No teams yet. Create one above.
          </div>
        ) : (
          <>
            <div className="p-2 border-b border-zinc-800/50">
              {teams.map((team: Team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded ${
                    (selectedTeam?.id === team.id)
                      ? 'bg-zinc-800 text-orange-400'
                      : 'text-zinc-400 hover:bg-zinc-800/50'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>

            {selectedTeam && (
              <div className="p-3 space-y-3">
                <h3 className="text-xs font-medium text-zinc-300">Members — {selectedTeam.name}</h3>
                <div className="space-y-1">
                  {members.map((m: TeamMember) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between text-xs px-2 py-1 rounded hover:bg-zinc-800/30"
                    >
                      <div>
                        <span className="text-zinc-200">{m.name}</span>
                        <span className="text-zinc-500 ml-2">{m.email}</span>
                        {m.status === 'invited' && (
                          <span className="text-amber-400/80 ml-2">(Awaiting accept)</span>
                        )}
                        <span className="text-zinc-600 ml-2 capitalize">({m.role})</span>
                      </div>
                      {m.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!p-1 text-red-400"
                          onClick={() =>
                            removeMemberMutation.mutate({ teamId: selectedTeam.id, memberId: m.id })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-3 space-y-2">
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <UserPlus className="h-3 w-3" /> Invite by email (account optional)
                  </p>
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="text-xs"
                  />
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                    className="text-xs w-full"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (!inviteEmail.trim()) return;
                      addMemberMutation.mutate({
                        teamId: selectedTeam.id,
                        email: inviteEmail.trim(),
                        role: inviteRole,
                      });
                    }}
                  >
                    Add to team
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
