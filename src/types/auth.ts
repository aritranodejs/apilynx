export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  hasPassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId?: string;
  email: string;
  name: string;
  role: TeamRole;
  status: 'invited' | 'active' | 'declined';
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  teamId?: string;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId?: string;
  email: string;
  name: string;
  role: TeamRole;
  status: 'invited' | 'active' | 'declined';
  joinedAt: string;
}

export interface ProjectInvite extends ProjectMember {
  projectName: string;
}

export interface TeamInvite extends TeamMember {
  teamName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface GoogleLoginPayload {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateProfilePayload {
  userId: string;
  name: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  teamId?: string | null;
}
