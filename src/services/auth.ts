import type {
  ChangePasswordPayload,
  LoginPayload,
  Project,
  ProjectInvite,
  ProjectMember,
  RegisterPayload,
  Team,
  TeamInvite,
  TeamMember,
  TeamRole,
  UpdateProfilePayload,
  UpdateProjectPayload,
  User,
  AuthResponse,
} from '@/types/auth';
import { api } from './ipc';

export const authService = {
  register: (payload: RegisterPayload): Promise<AuthResponse> => api().register(payload),
  login: (payload: LoginPayload): Promise<AuthResponse> => api().login(payload),
  loginWithGoogle: (): Promise<AuthResponse> => api().loginWithGoogle(),
  isGoogleConfigured: (): Promise<boolean> => api().isGoogleConfigured(),
  logout: (token: string): Promise<void> => api().logout(token),
  getSession: (token: string): Promise<User | null> => api().getSession(token),
  updateProfile: (payload: UpdateProfilePayload): Promise<User> => api().updateProfile(payload),
  changePassword: (payload: ChangePasswordPayload): Promise<void> => api().changePassword(payload),
};

export const projectService = {
  getAll: (userId: string): Promise<Project[]> => api().getProjects(userId),
  create: (name: string, ownerId: string, teamId?: string, description?: string): Promise<Project> =>
    api().createProject(name, ownerId, teamId, description),
  createPersonal: (ownerId: string, userName: string): Promise<Project> =>
    api().createPersonalProject(ownerId, userName),
  update: (projectId: string, updates: UpdateProjectPayload): Promise<Project> =>
    api().updateProject(projectId, updates),
  delete: (projectId: string): Promise<boolean> => api().deleteProject(projectId),
  inviteTeam: (projectId: string, teamId: string): Promise<Project> =>
    api().inviteTeamToProject(projectId, teamId),
  getMembers: (projectId: string): Promise<ProjectMember[]> => api().getProjectMembers(projectId),
  addMember: (projectId: string, email: string, role: TeamRole): Promise<ProjectMember> =>
    api().addProjectMember(projectId, email, role),
  removeMember: (projectId: string, memberId: string): Promise<boolean> =>
    api().removeProjectMember(projectId, memberId),
  updateMemberRole: (projectId: string, memberId: string, role: TeamRole): Promise<ProjectMember> =>
    api().updateProjectMemberRole(projectId, memberId, role),
};

export const inviteService = {
  getPendingProjects: (email: string): Promise<ProjectInvite[]> =>
    api().getPendingProjectInvites(email),
  getPendingTeams: (email: string): Promise<TeamInvite[]> => api().getPendingTeamInvites(email),
  acceptProject: (memberId: string, userId: string, email: string): Promise<ProjectMember> =>
    api().acceptProjectInvite(memberId, userId, email),
  declineProject: (memberId: string, userId: string, email: string): Promise<boolean> =>
    api().declineProjectInvite(memberId, userId, email),
  acceptTeam: (memberId: string, userId: string, email: string): Promise<TeamMember> =>
    api().acceptTeamInvite(memberId, userId, email),
  declineTeam: (memberId: string, userId: string, email: string): Promise<boolean> =>
    api().declineTeamInvite(memberId, userId, email),
};

export const teamService = {
  getAll: (userId: string): Promise<Team[]> => api().getTeams(userId),
  create: (name: string, ownerId: string, ownerEmail: string, ownerName: string): Promise<Team> =>
    api().createTeam(name, ownerId, ownerEmail, ownerName),
  getMembers: (teamId: string): Promise<TeamMember[]> => api().getTeamMembers(teamId),
  addMember: (teamId: string, email: string, role: TeamRole): Promise<TeamMember> =>
    api().addTeamMember(teamId, email, role),
  removeMember: (teamId: string, memberId: string): Promise<boolean> =>
    api().removeTeamMember(teamId, memberId),
};
