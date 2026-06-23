import bcrypt from 'bcryptjs';
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
  ProjectMember,
  RegisterPayload,
  Team,
  TeamMember,
  TeamRole,
  ProjectInvite,
  TeamInvite,
  User,
} from '@/types/auth';
import type { ElectronAPI } from '@/types/electron-api';
import { createEmptyKeyValue, generateId, methodAllowsBody, normalizeRequestUrl } from '@/lib/utils';

function getAPI(): ElectronAPI {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  throw new Error('Electron API not available. Run ReqForge as a desktop application.');
}

// --- localStorage-backed mock for browser-only dev ---
const MOCK_STORAGE_KEY = 'reqforge-mock-db';

interface MockUser extends User {
  passwordHash: string;
}

interface MockDB {
  settings: AppSettings;
  collections: Collection[];
  requests: ApiRequest[];
  history: HistoryEntry[];
  environments: Environment[];
  users: MockUser[];
  sessions: { token: string; userId: string; expiresAt: string }[];
  teams: Team[];
  teamMembers: TeamMember[];
  projectMembers: ProjectMember[];
  projects: Project[];
}

function loadMockDB(): MockDB {
  if (typeof window === 'undefined') {
    return getDefaultMockDB();
  }
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDB;
  } catch {
    /* use defaults */
  }
  const db = getDefaultMockDB();
  saveMockDB(db);
  return db;
}

function saveMockDB(db: MockDB): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  }
}

function linkMockInvites(db: MockDB, userId: string, email: string, name: string): void {
  const normalizedEmail = email.toLowerCase().trim();
  for (const m of db.projectMembers) {
    if (m.email === normalizedEmail && m.status === 'invited') {
      m.userId = userId;
      m.name = name;
    }
  }
  for (const m of db.teamMembers) {
    if (m.email === normalizedEmail && m.status === 'invited') {
      m.userId = userId;
      m.name = name;
    }
  }
}

function getDefaultMockDB(): MockDB {
  const now = new Date().toISOString();
  return {
    settings: {
      id: '1',
      theme: 'dark',
      timeout: 30000,
      autoSave: true,
      maxHistorySize: 10000,
      sidebarCollapsed: false,
    },
    collections: [],
    requests: [],
    history: [],
    users: [],
    sessions: [],
    teams: [],
    teamMembers: [],
    projectMembers: [],
    projects: [],
    environments: ['Local', 'Development', 'Staging', 'Production'].map((name, i) => ({
      id: generateId(),
      name,
      isDefault: i === 0,
      variables: [
        { id: generateId(), key: 'BASE_URL', value: 'http://localhost:3000', enabled: true, secret: false },
        { id: generateId(), key: 'TOKEN', value: '', enabled: true, secret: true },
        { id: generateId(), key: 'USER_ID', value: '', enabled: true, secret: false },
      ],
      createdAt: now,
      updatedAt: now,
    })),
  };
}

/** Mock API for web-only development without Electron */
const mockAPI: ElectronAPI = {
  sendRequest: async (payload): Promise<ApiResponse> => {
    const start = Date.now();
    const url = normalizeRequestUrl(payload.url);
    const canHaveBody = methodAllowsBody(payload.method);
    const reqBody =
      canHaveBody && typeof payload.body === 'string' && payload.body.length > 0
        ? payload.body
        : undefined;

    try {
      const res = await fetch(url, {
        method: payload.method,
        headers: payload.headers,
        ...(reqBody !== undefined ? { body: reqBody } : {}),
        signal: AbortSignal.timeout(payload.timeout),
      });
      const responseText = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      return {
        status: res.status,
        statusText: res.statusText,
        headers,
        body: responseText,
        size: new TextEncoder().encode(responseText).length,
        duration: Date.now() - start,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Request failed';
      return {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: message,
        size: message.length,
        duration: Date.now() - start,
      };
    }
  },
  cancelRequest: () => undefined,
  getSettings: async () => loadMockDB().settings,
  updateSettings: async (updates) => {
    const db = loadMockDB();
    db.settings = { ...db.settings, ...updates };
    saveMockDB(db);
    return db.settings;
  },
  getCollections: async (projectId) => {
    const db = loadMockDB();
    if (!projectId) return db.collections;
    return db.collections.filter((c) => c.projectId === projectId);
  },
  createCollection: async (name, description, projectId, ownerId, teamId) => {
    const db = loadMockDB();
    const col: Collection = {
      id: generateId(),
      name,
      description,
      folders: [],
      requestIds: [],
      projectId,
      ownerId,
      teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.collections.push(col);
    saveMockDB(db);
    return col;
  },
  updateCollection: async (id, updates) => {
    const db = loadMockDB();
    const idx = db.collections.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.collections[idx] = { ...db.collections[idx], ...updates, updatedAt: new Date().toISOString() };
    saveMockDB(db);
    return db.collections[idx];
  },
  deleteCollection: async (id) => {
    const db = loadMockDB();
    db.collections = db.collections.filter((c) => c.id !== id);
    db.requests = db.requests.filter((r) => r.collectionId !== id);
    saveMockDB(db);
    return true;
  },
  getRequest: async (id) => loadMockDB().requests.find((r) => r.id === id) ?? null,
  getRequestsByCollection: async (collectionId) =>
    loadMockDB().requests.filter((r) => r.collectionId === collectionId),
  saveRequest: async (request) => {
    const db = loadMockDB();
    const idx = db.requests.findIndex((r) => r.id === request.id);
    if (idx >= 0) db.requests[idx] = request;
    else db.requests.push(request);
    saveMockDB(db);
    return request;
  },
  deleteRequest: async (id) => {
    const db = loadMockDB();
    db.requests = db.requests.filter((r) => r.id !== id);
    saveMockDB(db);
    return true;
  },
  createRequestInCollection: async (collectionId, _folderId, name = 'New Request') => {
    const db = loadMockDB();
    const req: ApiRequest = {
      id: generateId(),
      name,
      method: 'GET',
      url: '',
      params: [createEmptyKeyValue()],
      headers: [createEmptyKeyValue()],
      body: { type: 'json', content: '{\n  \n}', formData: [createEmptyKeyValue()] },
      auth: { type: 'none' },
      collectionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.requests.push(req);
    const col = db.collections.find((c) => c.id === collectionId);
    if (col) col.requestIds.push(req.id);
    saveMockDB(db);
    return req;
  },
  getHistory: async (page, pageSize, search) => {
    const db = loadMockDB();
    let items = db.history;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((h) => h.url.toLowerCase().includes(q) || h.method.toLowerCase().includes(q));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
  addHistory: async (entry) => {
    const db = loadMockDB();
    const item: HistoryEntry = { ...entry, id: generateId() };
    db.history.unshift(item);
    if (db.history.length > db.settings.maxHistorySize) {
      db.history = db.history.slice(0, db.settings.maxHistorySize);
    }
    saveMockDB(db);
    return item;
  },
  deleteHistory: async (id) => {
    const db = loadMockDB();
    db.history = db.history.filter((h) => h.id !== id);
    saveMockDB(db);
    return true;
  },
  clearHistory: async () => {
    const db = loadMockDB();
    const count = db.history.length;
    db.history = [];
    saveMockDB(db);
    return count;
  },
  getEnvironments: async () => loadMockDB().environments,
  createEnvironment: async (name) => {
    const db = loadMockDB();
    const env: Environment = {
      id: generateId(),
      name,
      variables: [createEmptyKeyValue()].map((v) => ({ ...v, secret: false })),
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.environments.push(env);
    saveMockDB(db);
    return env;
  },
  updateEnvironment: async (id, updates) => {
    const db = loadMockDB();
    const idx = db.environments.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    if (updates.isDefault) {
      db.environments.forEach((e) => { e.isDefault = false; });
    }
    db.environments[idx] = {
      ...db.environments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveMockDB(db);
    return db.environments[idx];
  },
  deleteEnvironment: async (id) => {
    const db = loadMockDB();
    db.environments = db.environments.filter((e) => e.id !== id);
    saveMockDB(db);
    return true;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const db = loadMockDB();
    if (db.users.some((u) => u.email === payload.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const now = new Date().toISOString();
    const user: MockUser = {
      id: generateId(),
      email: payload.email.toLowerCase(),
      name: payload.name,
      passwordHash: await bcrypt.hash(payload.password, 10),
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(user);
    const token = generateId() + generateId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    db.sessions.push({ token, userId: user.id, expiresAt: expiresAt.toISOString() });
    const project: Project = {
      id: generateId(),
      name: `${user.name}'s Workspace`,
      ownerId: user.id,
      isPersonal: true,
      createdAt: now,
      updatedAt: now,
    };
    db.projects.push(project);
    db.projectMembers.push({
      id: generateId(),
      projectId: project.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'owner',
      status: 'active',
      joinedAt: now,
    });
    linkMockInvites(db, user.id, user.email, user.name);
    saveMockDB(db);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const db = loadMockDB();
    const user = db.users.find((u) => u.email === payload.email.toLowerCase());
    if (!user) throw new Error('Invalid email or password');
    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) throw new Error('Invalid email or password');
    const token = generateId() + generateId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    db.sessions.push({ token, userId: user.id, expiresAt: expiresAt.toISOString() });
    linkMockInvites(db, user.id, user.email, user.name);
    saveMockDB(db);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },
  logout: async (token: string): Promise<void> => {
    const db = loadMockDB();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveMockDB(db);
  },
  getSession: async (token: string): Promise<User | null> => {
    const db = loadMockDB();
    const session = db.sessions.find(
      (s) => s.token === token && new Date(s.expiresAt) > new Date()
    );
    if (!session) return null;
    const user = db.users.find((u) => u.id === session.userId);
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
  getProjects: async (userId: string): Promise<Project[]> => {
    const db = loadMockDB();
    const teamIds = db.teamMembers
      .filter((m) => m.userId === userId && m.status === 'active')
      .map((m) => m.teamId);
    const projectIds = db.projectMembers
      .filter((m) => m.userId === userId && m.status === 'active')
      .map((m) => m.projectId);
    return db.projects.filter(
      (p) =>
        p.ownerId === userId ||
        (p.teamId && teamIds.includes(p.teamId)) ||
        projectIds.includes(p.id)
    );
  },
  createProject: async (name, ownerId, teamId, description): Promise<Project> => {
    const db = loadMockDB();
    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name,
      description,
      ownerId,
      teamId,
      isPersonal: false,
      createdAt: now,
      updatedAt: now,
    };
    db.projects.push(project);
    const owner = db.users.find((u) => u.id === ownerId);
    db.projectMembers.push({
      id: generateId(),
      projectId: project.id,
      userId: ownerId,
      email: owner?.email ?? '',
      name: owner?.name ?? 'Owner',
      role: 'owner',
      status: 'active',
      joinedAt: now,
    });
    saveMockDB(db);
    return project;
  },
  createPersonalProject: async (ownerId, userName): Promise<Project> => {
    const db = loadMockDB();
    const existing = db.projects.find((p) => p.ownerId === ownerId && p.isPersonal);
    if (existing) {
      if (!db.projectMembers.some((m) => m.projectId === existing.id && m.userId === ownerId)) {
        const owner = db.users.find((u) => u.id === ownerId);
        db.projectMembers.push({
          id: generateId(),
          projectId: existing.id,
          userId: ownerId,
          email: owner?.email ?? '',
          name: owner?.name ?? userName,
          role: 'owner',
          status: 'active',
          joinedAt: new Date().toISOString(),
        });
        saveMockDB(db);
      }
      return existing;
    }
    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name: `${userName}'s Workspace`,
      ownerId,
      isPersonal: true,
      createdAt: now,
      updatedAt: now,
    };
    db.projects.push(project);
    const owner = db.users.find((u) => u.id === ownerId);
    db.projectMembers.push({
      id: generateId(),
      projectId: project.id,
      userId: ownerId,
      email: owner?.email ?? '',
      name: owner?.name ?? userName,
      role: 'owner',
      status: 'active',
      joinedAt: now,
    });
    saveMockDB(db);
    return project;
  },
  getTeams: async (userId: string): Promise<Team[]> => {
    const db = loadMockDB();
    const teamIds = db.teamMembers
      .filter((m) => m.userId === userId && m.status === 'active')
      .map((m) => m.teamId);
    return db.teams.filter((t) => t.ownerId === userId || teamIds.includes(t.id));
  },
  createTeam: async (name, ownerId, ownerEmail, ownerName): Promise<Team> => {
    const db = loadMockDB();
    const now = new Date().toISOString();
    const team: Team = {
      id: generateId(),
      name,
      ownerId,
      createdAt: now,
      updatedAt: now,
    };
    db.teams.push(team);
    db.teamMembers.push({
      id: generateId(),
      teamId: team.id,
      userId: ownerId,
      email: ownerEmail,
      name: ownerName,
      role: 'owner',
      status: 'active',
      joinedAt: now,
    });
    saveMockDB(db);
    return team;
  },
  getTeamMembers: async (teamId: string): Promise<TeamMember[]> =>
    loadMockDB().teamMembers.filter((m) => m.teamId === teamId),
  addTeamMember: async (teamId, email, role: TeamRole): Promise<TeamMember> => {
    const db = loadMockDB();
    const normalizedEmail = email.trim().toLowerCase();
    if (db.teamMembers.some((m) => m.teamId === teamId && m.email === normalizedEmail)) {
      const existing = db.teamMembers.find((m) => m.teamId === teamId && m.email === normalizedEmail)!;
      if (existing.status === 'invited') throw new Error('Invitation already sent to this email');
      throw new Error('User is already a team member');
    }
    const user = db.users.find((u) => u.email === normalizedEmail);
    const now = new Date().toISOString();
    const member: TeamMember = {
      id: generateId(),
      teamId,
      userId: user?.id,
      email: normalizedEmail,
      name: user?.name ?? normalizedEmail.split('@')[0],
      role,
      status: 'invited',
      joinedAt: now,
    };
    db.teamMembers.push(member);
    saveMockDB(db);
    return member;
  },
  removeTeamMember: async (teamId, memberId): Promise<boolean> => {
    const db = loadMockDB();
    const before = db.teamMembers.length;
    db.teamMembers = db.teamMembers.filter(
      (m) => !(m.teamId === teamId && (m.id === memberId || m.userId === memberId))
    );
    saveMockDB(db);
    return db.teamMembers.length < before;
  },
  updateProfile: async (payload) => {
    const db = loadMockDB();
    const idx = db.users.findIndex((u) => u.id === payload.userId);
    if (idx === -1) throw new Error('User not found');
    db.users[idx] = {
      ...db.users[idx],
      name: payload.name,
      avatarUrl: payload.avatarUrl,
      updatedAt: new Date().toISOString(),
    };
    saveMockDB(db);
    const { passwordHash: _, ...safeUser } = db.users[idx];
    return safeUser;
  },
  changePassword: async (payload) => {
    const db = loadMockDB();
    const user = db.users.find((u) => u.id === payload.userId);
    if (!user) throw new Error('User not found');
    const valid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');
    user.passwordHash = await bcrypt.hash(payload.newPassword, 10);
    saveMockDB(db);
  },
  updateProject: async (projectId, updates) => {
    const db = loadMockDB();
    const idx = db.projects.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error('Project not found');
    const normalized = {
      ...updates,
      teamId: updates.teamId === null ? undefined : updates.teamId,
    };
    db.projects[idx] = {
      ...db.projects[idx],
      ...normalized,
      updatedAt: new Date().toISOString(),
    };
    saveMockDB(db);
    return db.projects[idx];
  },
  deleteProject: async (projectId) => {
    const db = loadMockDB();
    const before = db.projects.length;
    db.projects = db.projects.filter((p) => !(p.id === projectId && !p.isPersonal));
    saveMockDB(db);
    return db.projects.length < before;
  },
  inviteTeamToProject: async (projectId, teamId) => {
    const db = loadMockDB();
    const team = db.teams.find((t) => t.id === teamId);
    if (!team) throw new Error('Team not found');
    const idx = db.projects.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error('Project not found');
    db.projects[idx] = {
      ...db.projects[idx],
      teamId,
      updatedAt: new Date().toISOString(),
    };
    saveMockDB(db);
    return db.projects[idx];
  },
  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> =>
    loadMockDB().projectMembers.filter((m) => m.projectId === projectId),
  addProjectMember: async (projectId, email, role: TeamRole): Promise<ProjectMember> => {
    const db = loadMockDB();
    const normalizedEmail = email.trim().toLowerCase();
    const project = db.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    if (db.projectMembers.some((m) => m.projectId === projectId && m.email === normalizedEmail)) {
      const existing = db.projectMembers.find(
        (m) => m.projectId === projectId && m.email === normalizedEmail
      )!;
      if (existing.status === 'invited') throw new Error('Invitation already sent to this email');
      throw new Error('User is already a member of this workspace');
    }
    const user = db.users.find((u) => u.email === normalizedEmail);
    if (user?.id === project.ownerId) throw new Error('Owner is already in this workspace');
    const now = new Date().toISOString();
    const member: ProjectMember = {
      id: generateId(),
      projectId,
      userId: user?.id,
      email: normalizedEmail,
      name: user?.name ?? normalizedEmail.split('@')[0],
      role,
      status: 'invited',
      joinedAt: now,
    };
    db.projectMembers.push(member);
    saveMockDB(db);
    return member;
  },
  removeProjectMember: async (projectId, memberId): Promise<boolean> => {
    const db = loadMockDB();
    const member = db.projectMembers.find(
      (m) => m.projectId === projectId && (m.id === memberId || m.userId === memberId)
    );
    if (!member) return false;
    if (member.role === 'owner') throw new Error('Cannot remove the workspace owner');
    const before = db.projectMembers.length;
    db.projectMembers = db.projectMembers.filter(
      (m) => !(m.projectId === projectId && (m.id === memberId || m.userId === memberId))
    );
    saveMockDB(db);
    return db.projectMembers.length < before;
  },
  updateProjectMemberRole: async (projectId, memberId, role: TeamRole): Promise<ProjectMember> => {
    if (role === 'owner') throw new Error('Cannot assign owner role via invite');
    const db = loadMockDB();
    const idx = db.projectMembers.findIndex(
      (m) => m.projectId === projectId && (m.id === memberId || m.userId === memberId)
    );
    if (idx === -1) throw new Error('Member not found');
    db.projectMembers[idx] = { ...db.projectMembers[idx], role };
    saveMockDB(db);
    return db.projectMembers[idx];
  },
  getPendingProjectInvites: async (email: string): Promise<ProjectInvite[]> => {
    const db = loadMockDB();
    const normalizedEmail = email.toLowerCase().trim();
    return db.projectMembers
      .filter((m) => m.email === normalizedEmail && m.status === 'invited')
      .map((m) => ({
        ...m,
        projectName: db.projects.find((p) => p.id === m.projectId)?.name ?? 'Workspace',
      }));
  },
  getPendingTeamInvites: async (email: string): Promise<TeamInvite[]> => {
    const db = loadMockDB();
    const normalizedEmail = email.toLowerCase().trim();
    return db.teamMembers
      .filter((m) => m.email === normalizedEmail && m.status === 'invited')
      .map((m) => ({
        ...m,
        teamName: db.teams.find((t) => t.id === m.teamId)?.name ?? 'Team',
      }));
  },
  acceptProjectInvite: async (memberId, userId, email): Promise<ProjectMember> => {
    const db = loadMockDB();
    const member = db.projectMembers.find((m) => m.id === memberId);
    if (!member || member.status !== 'invited') throw new Error('Invitation not found');
    if (member.email !== email.toLowerCase().trim() && member.userId !== userId) {
      throw new Error('This invitation is not for you');
    }
    member.userId = userId;
    member.status = 'active';
    member.joinedAt = new Date().toISOString();
    saveMockDB(db);
    return member;
  },
  declineProjectInvite: async (memberId, userId, email): Promise<boolean> => {
    const db = loadMockDB();
    const idx = db.projectMembers.findIndex((m) => m.id === memberId);
    if (idx === -1) return false;
    const member = db.projectMembers[idx];
    if (member.status !== 'invited') return false;
    if (member.email !== email.toLowerCase().trim() && member.userId !== userId) {
      throw new Error('This invitation is not for you');
    }
    member.status = 'declined';
    saveMockDB(db);
    return true;
  },
  acceptTeamInvite: async (memberId, userId, email): Promise<TeamMember> => {
    const db = loadMockDB();
    const member = db.teamMembers.find((m) => m.id === memberId);
    if (!member || member.status !== 'invited') throw new Error('Invitation not found');
    if (member.email !== email.toLowerCase().trim() && member.userId !== userId) {
      throw new Error('This invitation is not for you');
    }
    member.userId = userId;
    member.status = 'active';
    member.joinedAt = new Date().toISOString();
    saveMockDB(db);
    return member;
  },
  declineTeamInvite: async (memberId, userId, email): Promise<boolean> => {
    const db = loadMockDB();
    const member = db.teamMembers.find((m) => m.id === memberId);
    if (!member || member.status !== 'invited') return false;
    if (member.email !== email.toLowerCase().trim() && member.userId !== userId) {
      throw new Error('This invitation is not for you');
    }
    member.status = 'declined';
    saveMockDB(db);
    return true;
  },
  getVersion: async () => '0.1.0',
  getPlatform: async () => 'web',
  startMockServer: async () => {
    throw new Error('Mock server requires Electron desktop app');
  },
  stopMockServer: async () => {},
  getMockServerStatus: async () => ({ running: false, port: 0 }),
};

export function api(): ElectronAPI {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return mockAPI;
}

async function invoke<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    throw new Error(message);
  }
}

export const httpService = {
  send: (payload: SendRequestPayload) => invoke(() => api().sendRequest(payload)),
  cancel: (signalId: string) => api().cancelRequest(signalId),
};

export const settingsService = {
  get: (): Promise<AppSettings> => invoke(() => api().getSettings()),
  update: (updates: Partial<AppSettings>): Promise<AppSettings> =>
    invoke(() => api().updateSettings(updates)),
};

export const collectionService = {
  getAll: (projectId?: string): Promise<Collection[]> =>
    invoke(() => api().getCollections(projectId)),
  create: (
    name: string,
    description?: string,
    projectId?: string,
    ownerId?: string,
    teamId?: string
  ): Promise<Collection> =>
    invoke(() => api().createCollection(name, description, projectId, ownerId, teamId)),
  update: (id: string, updates: Partial<Collection>): Promise<Collection | null> =>
    invoke(() => api().updateCollection(id, updates)),
  delete: (id: string): Promise<boolean> => invoke(() => api().deleteCollection(id)),
};

export const requestService = {
  get: (id: string): Promise<ApiRequest | null> => invoke(() => api().getRequest(id)),
  getByCollection: (collectionId: string): Promise<ApiRequest[]> =>
    invoke(() => api().getRequestsByCollection(collectionId)),
  save: (request: ApiRequest): Promise<ApiRequest> => invoke(() => api().saveRequest(request)),
  delete: (id: string): Promise<boolean> => invoke(() => api().deleteRequest(id)),
  createInCollection: (
    collectionId: string,
    folderId?: string,
    name?: string
  ): Promise<ApiRequest> => invoke(() => api().createRequestInCollection(collectionId, folderId, name)),
};

export const historyService = {
  get: (page: number, pageSize: number, search: string): Promise<PaginatedResult<HistoryEntry>> =>
    invoke(() => api().getHistory(page, pageSize, search)),
  add: (entry: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry> => invoke(() => api().addHistory(entry)),
  delete: (id: string): Promise<boolean> => invoke(() => api().deleteHistory(id)),
  clear: (): Promise<number> => invoke(() => api().clearHistory()),
};

export const environmentService = {
  getAll: (): Promise<Environment[]> => invoke(() => api().getEnvironments()),
  create: (name: string): Promise<Environment> => invoke(() => api().createEnvironment(name)),
  update: (id: string, updates: Partial<Environment>): Promise<Environment | null> =>
    invoke(() => api().updateEnvironment(id, updates)),
  delete: (id: string): Promise<boolean> => invoke(() => api().deleteEnvironment(id)),
};

export function isElectronApp(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

export const mockServerService = {
  start: (port: number, routes: { method: string; path: string; status: number; body: string; contentType?: string }[]) =>
    invoke(() => api().startMockServer(port, routes)),
  stop: () => invoke(() => api().stopMockServer()),
  getStatus: () => invoke(() => api().getMockServerStatus()),
};
