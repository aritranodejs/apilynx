export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type BodyType = 'json' | 'raw' | 'form-data' | 'x-www-form-urlencoded' | 'graphql';

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: AuthType;
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  apiKeyKey?: string;
  apiKeyValue?: string;
  apiKeyAddTo?: 'header' | 'query';
}

export interface RequestBody {
  type: BodyType;
  content: string;
  formData: KeyValuePair[];
}

export interface RequestTest {
  id: string;
  name: string;
  type: 'status' | 'body_contains' | 'response_time';
  expected: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  description?: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: AuthConfig;
  tests?: RequestTest[];
  exampleResponse?: string;
  collectionId?: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestTab {
  id: string;
  request: ApiRequest;
  response?: ApiResponse;
  isLoading: boolean;
  duration?: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  size: number;
  duration: number;
}

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  duration: number;
  timestamp: string;
  requestSnapshot: ApiRequest;
}

export interface CollectionFolder {
  id: string;
  name: string;
  parentId?: string;
  children: CollectionFolder[];
  requestIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: CollectionFolder[];
  requestIds: string[];
  projectId?: string;
  ownerId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  secret: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  theme: ThemeMode;
  timeout: number;
  autoSave: boolean;
  defaultEnvironmentId?: string;
  maxHistorySize: number;
  sidebarCollapsed: boolean;
}

export interface SendRequestPayload {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string | FormData;
  bodyType: BodyType;
  timeout: number;
  signalId: string;
}

export interface RunnerResult {
  requestId: string;
  requestName: string;
  method: HttpMethod;
  url: string;
  status: number;
  duration: number;
  passed: boolean;
  testResults: { name: string; passed: boolean; message: string }[];
  error?: string;
}

export interface CollectionExport {
  version: 1;
  name: string;
  description?: string;
  requests: ApiRequest[];
  exportedAt: string;
}

export type CodeLanguage =
  | 'javascript-fetch'
  | 'axios'
  | 'nodejs'
  | 'curl'
  | 'php-curl'
  | 'laravel'
  | 'python'
  | 'java-okhttp';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type { User, Team, TeamMember, Project, ProjectMember, ProjectInvite, TeamInvite, TeamRole, AuthSession, LoginPayload, RegisterPayload, AuthResponse, UpdateProfilePayload, ChangePasswordPayload, UpdateProjectPayload } from '@/types/auth';
