import type { IpcMainInvokeEvent } from 'electron';
import axios, { type AxiosResponse } from 'axios';
import type { ApiRequest, ApiResponse, AppSettings, Collection, Environment, HistoryEntry, PaginatedResult, SendRequestPayload } from '../src/types';
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  Project,
  ProjectInvite,
  ProjectMember,
  RegisterPayload,
  TeamInvite,
  Team,
  TeamMember,
  TeamRole,
  UpdateProfilePayload,
  UpdateProjectPayload,
  User,
} from '../src/types/auth';
import { methodAllowsBody, normalizeRequestUrl } from '../src/lib/utils';
import { isGoogleAuthConfigured, signInWithGoogle } from './google-auth';
import {
  addHistoryEntry,
  clearHistory,
  connectDatabase,
  createCollection,
  createEnvironment,
  createRequestInCollection,
  deleteCollection,
  deleteEnvironment,
  deleteHistoryEntry,
  deleteRequest,
  disconnectDatabase,
  getCollections,
  getCollection,
  getEnvironments,
  getHistory,
  getRequest,
  getRequestsByCollection,
  getSettings,
  saveRequest,
  updateCollection,
  updateEnvironment,
  updateSettings,
} from '../src/database/repositories';
import {
  addTeamMember,
  createPersonalProject,
  createProject,
  createTeam,
  getProjects,
  getSessionUser,
  getTeamMembers,
  getTeams,
  login,
  loginWithGoogle,
  logout,
  register,
  removeTeamMember,
  updateProfile,
  changePassword,
  updateProject,
  deleteProject,
  inviteTeamToProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  acceptProjectInvite,
  declineProjectInvite,
  acceptTeamInvite,
  declineTeamInvite,
  getPendingProjectInvites,
  getPendingTeamInvites,
} from '../src/database/repositories/auth-repository';
import {
  startMockServer,
  stopMockServer,
  getMockServerStatus,
  type MockRoute,
} from './mock-server';

const activeRequests = new Map<string, AbortController>();

export async function initializeDatabase(): Promise<void> {
  await connectDatabase();
}

export async function shutdownDatabase(): Promise<void> {
  activeRequests.forEach((controller) => controller.abort());
  activeRequests.clear();
  await disconnectDatabase();
}

export async function handleSendRequest(
  _event: IpcMainInvokeEvent,
  payload: SendRequestPayload
): Promise<ApiResponse> {
  const controller = new AbortController();
  activeRequests.set(payload.signalId, controller);

  const start = Date.now();

  try {
    let response: AxiosResponse<string>;

    const config = {
      method: payload.method.toLowerCase(),
      url: normalizeRequestUrl(payload.url),
      headers: payload.headers,
      timeout: payload.timeout,
      signal: controller.signal,
      validateStatus: () => true,
      responseType: 'text' as const,
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024,
    };

    const canHaveBody = methodAllowsBody(payload.method);

    if (canHaveBody && payload.body !== undefined && payload.bodyType !== 'form-data') {
      response = await axios({ ...config, data: payload.body });
    } else if (canHaveBody && payload.bodyType === 'form-data' && payload.body instanceof FormData) {
      const formHeaders: Record<string, string> = { ...payload.headers };
      delete formHeaders['Content-Type'];
      response = await axios({ ...config, headers: formHeaders, data: payload.body });
    } else {
      response = await axios(config);
    }

    const duration = Date.now() - start;
    const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const size = new TextEncoder().encode(body).length;

    const headers: Record<string, string> = {};
    Object.entries(response.headers).forEach(([key, value]) => {
      if (typeof value === 'string') headers[key] = value;
      else if (Array.isArray(value)) headers[key] = value.join(', ');
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
      size,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - start;
    if (axios.isCancel(error)) {
      return {
        status: 0,
        statusText: 'Cancelled',
        headers: {},
        body: 'Request was cancelled',
        size: 0,
        duration,
      };
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      body: message,
      size: message.length,
      duration,
    };
  } finally {
    activeRequests.delete(payload.signalId);
  }
}

export function handleCancelRequest(
  _event: IpcMainInvokeEvent,
  signalId: string
): void {
  const controller = activeRequests.get(signalId);
  if (controller) {
    controller.abort();
    activeRequests.delete(signalId);
  }
}

// Database IPC handlers
export const dbHandlers = {
  'db:getSettings': async (): Promise<AppSettings> => getSettings(),
  'db:updateSettings': async (_e: IpcMainInvokeEvent, updates: Partial<AppSettings>): Promise<AppSettings> =>
    updateSettings(updates),
  'db:getCollections': async (_e: IpcMainInvokeEvent, projectId?: string): Promise<Collection[]> =>
    getCollections(projectId),
  'db:getCollection': async (_e: IpcMainInvokeEvent, id: string): Promise<Collection | null> =>
    getCollection(id),
  'db:createCollection': async (
    _e: IpcMainInvokeEvent,
    name: string,
    description?: string,
    projectId?: string,
    ownerId?: string,
    teamId?: string
  ): Promise<Collection> => createCollection(name, description, projectId, ownerId, teamId),
  'db:updateCollection': async (
    _e: IpcMainInvokeEvent,
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection | null> => updateCollection(id, updates),
  'db:deleteCollection': async (_e: IpcMainInvokeEvent, id: string): Promise<boolean> =>
    deleteCollection(id),
  'db:getRequest': async (_e: IpcMainInvokeEvent, id: string): Promise<ApiRequest | null> =>
    getRequest(id),
  'db:getRequestsByCollection': async (_e: IpcMainInvokeEvent, collectionId: string): Promise<ApiRequest[]> =>
    getRequestsByCollection(collectionId),
  'db:saveRequest': async (_e: IpcMainInvokeEvent, request: ApiRequest): Promise<ApiRequest> =>
    saveRequest(request),
  'db:deleteRequest': async (_e: IpcMainInvokeEvent, id: string): Promise<boolean> =>
    deleteRequest(id),
  'db:createRequestInCollection': async (
    _e: IpcMainInvokeEvent,
    collectionId: string,
    folderId?: string,
    name?: string
  ): Promise<ApiRequest> => createRequestInCollection(collectionId, folderId, name),
  'db:getHistory': async (
    _e: IpcMainInvokeEvent,
    page: number,
    pageSize: number,
    search: string
  ): Promise<PaginatedResult<HistoryEntry>> => getHistory(page, pageSize, search),
  'db:addHistory': async (_e: IpcMainInvokeEvent, entry: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry> =>
    addHistoryEntry(entry),
  'db:deleteHistory': async (_e: IpcMainInvokeEvent, id: string): Promise<boolean> =>
    deleteHistoryEntry(id),
  'db:clearHistory': async (): Promise<number> => clearHistory(),
  'db:getEnvironments': async (): Promise<Environment[]> => getEnvironments(),
  'db:createEnvironment': async (_e: IpcMainInvokeEvent, name: string): Promise<Environment> =>
    createEnvironment(name),
  'db:updateEnvironment': async (
    _e: IpcMainInvokeEvent,
    id: string,
    updates: Partial<Environment>
  ): Promise<Environment | null> => updateEnvironment(id, updates),
  'db:deleteEnvironment': async (_e: IpcMainInvokeEvent, id: string): Promise<boolean> =>
    deleteEnvironment(id),

  // Auth
  'auth:register': async (_e: IpcMainInvokeEvent, payload: RegisterPayload): Promise<AuthResponse> =>
    register(payload),
  'auth:login': async (_e: IpcMainInvokeEvent, payload: LoginPayload): Promise<AuthResponse> =>
    login(payload),
  'auth:loginWithGoogle': async (): Promise<AuthResponse> => {
    const profile = await signInWithGoogle();
    return loginWithGoogle(profile);
  },
  'auth:isGoogleConfigured': async (): Promise<boolean> => isGoogleAuthConfigured(),
  'auth:logout': async (_e: IpcMainInvokeEvent, token: string): Promise<void> => logout(token),
  'auth:getSession': async (_e: IpcMainInvokeEvent, token: string): Promise<User | null> =>
    getSessionUser(token),

  // Projects
  'project:getAll': async (_e: IpcMainInvokeEvent, userId: string): Promise<Project[]> =>
    getProjects(userId),
  'project:create': async (
    _e: IpcMainInvokeEvent,
    name: string,
    ownerId: string,
    teamId?: string,
    description?: string
  ): Promise<Project> => createProject(name, ownerId, teamId, description),
  'project:createPersonal': async (_e: IpcMainInvokeEvent, ownerId: string, userName: string): Promise<Project> =>
    createPersonalProject(ownerId, userName),

  // Teams
  'team:getAll': async (_e: IpcMainInvokeEvent, userId: string): Promise<Team[]> => getTeams(userId),
  'team:create': async (
    _e: IpcMainInvokeEvent,
    name: string,
    ownerId: string,
    ownerEmail: string,
    ownerName: string
  ): Promise<Team> => createTeam(name, ownerId, ownerEmail, ownerName),
  'team:getMembers': async (_e: IpcMainInvokeEvent, teamId: string): Promise<TeamMember[]> =>
    getTeamMembers(teamId),
  'team:addMember': async (
    _e: IpcMainInvokeEvent,
    teamId: string,
    email: string,
    role: TeamRole
  ): Promise<TeamMember> => addTeamMember(teamId, email, role),
  'team:removeMember': async (_e: IpcMainInvokeEvent, teamId: string, memberId: string): Promise<boolean> =>
    removeTeamMember(teamId, memberId),
  'auth:updateProfile': async (_e: IpcMainInvokeEvent, payload: UpdateProfilePayload): Promise<User> =>
    updateProfile(payload),
  'auth:changePassword': async (_e: IpcMainInvokeEvent, payload: ChangePasswordPayload): Promise<void> =>
    changePassword(payload),
  'project:update': async (
    _e: IpcMainInvokeEvent,
    projectId: string,
    updates: UpdateProjectPayload
  ): Promise<Project> => updateProject(projectId, updates),
  'project:delete': async (_e: IpcMainInvokeEvent, projectId: string): Promise<boolean> =>
    deleteProject(projectId),
  'project:inviteTeam': async (_e: IpcMainInvokeEvent, projectId: string, teamId: string): Promise<Project> =>
    inviteTeamToProject(projectId, teamId),
  'project:getMembers': async (_e: IpcMainInvokeEvent, projectId: string): Promise<ProjectMember[]> =>
    getProjectMembers(projectId),
  'project:addMember': async (
    _e: IpcMainInvokeEvent,
    projectId: string,
    email: string,
    role: TeamRole
  ): Promise<ProjectMember> => addProjectMember(projectId, email, role),
  'project:removeMember': async (
    _e: IpcMainInvokeEvent,
    projectId: string,
    memberId: string
  ): Promise<boolean> => removeProjectMember(projectId, memberId),
  'project:updateMemberRole': async (
    _e: IpcMainInvokeEvent,
    projectId: string,
    memberId: string,
    role: TeamRole
  ): Promise<ProjectMember> => updateProjectMemberRole(projectId, memberId, role),
  'invite:getPendingProjects': async (_e: IpcMainInvokeEvent, email: string): Promise<ProjectInvite[]> =>
    getPendingProjectInvites(email),
  'invite:getPendingTeams': async (_e: IpcMainInvokeEvent, email: string): Promise<TeamInvite[]> =>
    getPendingTeamInvites(email),
  'invite:acceptProject': async (
    _e: IpcMainInvokeEvent,
    memberId: string,
    userId: string,
    email: string
  ): Promise<ProjectMember> => acceptProjectInvite(memberId, userId, email),
  'invite:declineProject': async (
    _e: IpcMainInvokeEvent,
    memberId: string,
    userId: string,
    email: string
  ): Promise<boolean> => declineProjectInvite(memberId, userId, email),
  'invite:acceptTeam': async (
    _e: IpcMainInvokeEvent,
    memberId: string,
    userId: string,
    email: string
  ): Promise<TeamMember> => acceptTeamInvite(memberId, userId, email),
  'invite:declineTeam': async (
    _e: IpcMainInvokeEvent,
    memberId: string,
    userId: string,
    email: string
  ): Promise<boolean> => declineTeamInvite(memberId, userId, email),

  'mock:start': async (_e: IpcMainInvokeEvent, port: number, routes: MockRoute[]): Promise<number> =>
    startMockServer(port, routes),
  'mock:stop': async (): Promise<void> => {
    stopMockServer();
  },
  'mock:status': async (): Promise<{ running: boolean; port: number }> => getMockServerStatus(),
};
