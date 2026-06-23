import type {
  ApiRequest,
  ApiResponse,
  AppSettings,
  Collection,
  Environment,
  HistoryEntry,
  PaginatedResult,
  SendRequestPayload,
} from '@/types';
import type {
  AuthResponse,
  LoginPayload,
  Project,
  ProjectInvite,
  ProjectMember,
  RegisterPayload,
  TeamInvite,
  Team,
  TeamMember,
  TeamRole,
  User,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateProjectPayload,
} from '@/types/auth';

export interface ElectronAPI {
  sendRequest: (payload: SendRequestPayload) => Promise<ApiResponse>;
  cancelRequest: (signalId: string) => void;
  getSettings: () => Promise<AppSettings>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<AppSettings>;
  getCollections: (projectId?: string) => Promise<Collection[]>;
  createCollection: (
    name: string,
    description?: string,
    projectId?: string,
    ownerId?: string,
    teamId?: string
  ) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<Collection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  getRequest: (id: string) => Promise<ApiRequest | null>;
  getRequestsByCollection: (collectionId: string) => Promise<ApiRequest[]>;
  saveRequest: (request: ApiRequest) => Promise<ApiRequest>;
  deleteRequest: (id: string) => Promise<boolean>;
  createRequestInCollection: (
    collectionId: string,
    folderId?: string,
    name?: string
  ) => Promise<ApiRequest>;
  getHistory: (page: number, pageSize: number, search: string) => Promise<PaginatedResult<HistoryEntry>>;
  addHistory: (entry: Omit<HistoryEntry, 'id'>) => Promise<HistoryEntry>;
  deleteHistory: (id: string) => Promise<boolean>;
  clearHistory: () => Promise<number>;
  getEnvironments: () => Promise<Environment[]>;
  createEnvironment: (name: string) => Promise<Environment>;
  updateEnvironment: (id: string, updates: Partial<Environment>) => Promise<Environment | null>;
  deleteEnvironment: (id: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: (token: string) => Promise<void>;
  getSession: (token: string) => Promise<User | null>;
  getProjects: (userId: string) => Promise<Project[]>;
  createProject: (name: string, ownerId: string, teamId?: string, description?: string) => Promise<Project>;
  createPersonalProject: (ownerId: string, userName: string) => Promise<Project>;
  getTeams: (userId: string) => Promise<Team[]>;
  createTeam: (name: string, ownerId: string, ownerEmail: string, ownerName: string) => Promise<Team>;
  getTeamMembers: (teamId: string) => Promise<TeamMember[]>;
  addTeamMember: (teamId: string, email: string, role: TeamRole) => Promise<TeamMember>;
  removeTeamMember: (teamId: string, memberId: string) => Promise<boolean>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  updateProject: (projectId: string, updates: UpdateProjectPayload) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<boolean>;
  inviteTeamToProject: (projectId: string, teamId: string) => Promise<Project>;
  getProjectMembers: (projectId: string) => Promise<ProjectMember[]>;
  addProjectMember: (projectId: string, email: string, role: TeamRole) => Promise<ProjectMember>;
  removeProjectMember: (projectId: string, memberId: string) => Promise<boolean>;
  updateProjectMemberRole: (projectId: string, memberId: string, role: TeamRole) => Promise<ProjectMember>;
  getPendingProjectInvites: (email: string) => Promise<ProjectInvite[]>;
  getPendingTeamInvites: (email: string) => Promise<TeamInvite[]>;
  acceptProjectInvite: (memberId: string, userId: string, email: string) => Promise<ProjectMember>;
  declineProjectInvite: (memberId: string, userId: string, email: string) => Promise<boolean>;
  acceptTeamInvite: (memberId: string, userId: string, email: string) => Promise<TeamMember>;
  declineTeamInvite: (memberId: string, userId: string, email: string) => Promise<boolean>;
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  startMockServer: (port: number, routes: MockRoute[]) => Promise<number>;
  stopMockServer: () => Promise<void>;
  getMockServerStatus: () => Promise<{ running: boolean; port: number }>;
}

export interface MockRoute {
  method: string;
  path: string;
  status: number;
  body: string;
  contentType?: string;
}
