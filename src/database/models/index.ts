import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type {
  ApiRequest,
  AppSettings,
  AuthConfig,
  Collection,
  CollectionFolder,
  Environment,
  HistoryEntry,
  KeyValuePair,
  RequestBody,
  RequestTab,
} from '@/types';

// --- Sub-schemas ---

const keyValueSchema = new Schema<KeyValuePair>(
  {
    id: { type: String, required: true },
    key: { type: String, default: '' },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const authSchema = new Schema<AuthConfig>(
  {
    type: { type: String, enum: ['inherit', 'none', 'bearer', 'basic', 'api-key'], default: 'none' },
    bearerToken: String,
    basicUsername: String,
    basicPassword: String,
    apiKeyKey: String,
    apiKeyValue: String,
    apiKeyAddTo: { type: String, enum: ['header', 'query'] },
  },
  { _id: false }
);

const bodySchema = new Schema<RequestBody>(
  {
    type: {
      type: String,
      enum: ['json', 'raw', 'form-data', 'x-www-form-urlencoded', 'graphql'],
      default: 'json',
    },
    content: { type: String, default: '' },
    formData: [keyValueSchema],
  },
  { _id: false }
);

const folderSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    parentId: String,
    children: { type: Schema.Types.Mixed, default: [] },
    requestIds: { type: [String], default: [] },
  },
  { _id: false }
);

// --- Settings ---

export type SettingsDocument = Document & Omit<AppSettings, 'id'>;

const settingsSchema = new Schema(
  {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    timeout: { type: Number, default: 30000 },
    autoSave: { type: Boolean, default: true },
    defaultEnvironmentId: String,
    maxHistorySize: { type: Number, default: 10000 },
    sidebarCollapsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SettingsModel: Model<SettingsDocument> =
  mongoose.models.Settings ?? mongoose.model<SettingsDocument>('Settings', settingsSchema);

// --- Collections ---

export type CollectionDocument = Document & Omit<Collection, 'id'>;

const collectionSchema = new Schema(
  {
    clientId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    description: String,
    auth: { type: authSchema, default: () => ({ type: 'none' }) },
    folders: [folderSchema],
    requestIds: { type: [String], default: [] },
    projectId: { type: String, index: true },
    ownerId: { type: String, index: true },
    teamId: { type: String, index: true },
  },
  { timestamps: true }
);

export const CollectionModel: Model<CollectionDocument> =
  mongoose.models.Collection ??
  mongoose.model<CollectionDocument>('Collection', collectionSchema);

// --- Requests ---

export type RequestDocument = Document & Omit<ApiRequest, 'id'>;

const requestTestSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    type: { type: String, enum: ['status', 'body_contains', 'response_time'], default: 'status' },
    expected: { type: String, default: '200' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const requestSchema = new Schema(
  {
    clientId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    description: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET',
    },
    url: { type: String, default: '' },
    params: [keyValueSchema],
    headers: [keyValueSchema],
    body: { type: bodySchema, default: () => ({}) },
    auth: { type: authSchema, default: () => ({ type: 'inherit' }) },
    tests: [requestTestSchema],
    exampleResponse: String,
    collectionId: String,
    folderId: String,
  },
  { timestamps: true }
);

requestSchema.index({ collectionId: 1 });
requestSchema.index({ name: 'text' });

export const RequestModel: Model<RequestDocument> =
  mongoose.models.Request ?? mongoose.model<RequestDocument>('Request', requestSchema);

// --- Request Tabs ---

export type RequestTabDocument = Document & Omit<RequestTab, 'request' | 'id'> & {
  requestId: string;
  order: number;
};

const requestTabSchema = new Schema(
  {
    requestId: { type: String, required: true },
    order: { type: Number, default: 0 },
    isLoading: { type: Boolean, default: false },
    duration: Number,
    response: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const RequestTabModel: Model<RequestTabDocument> =
  mongoose.models.RequestTab ??
  mongoose.model<RequestTabDocument>('RequestTab', requestTabSchema);

// --- History ---

export type HistoryDocument = Document & Omit<HistoryEntry, 'id'>;

const historySchema = new Schema(
  {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      required: true,
    },
    url: { type: String, required: true },
    status: { type: Number, required: true },
    statusText: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    timestamp: { type: String, required: true },
    requestSnapshot: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

historySchema.index({ timestamp: -1 });
historySchema.index({ url: 'text', method: 1 });

export const HistoryModel: Model<HistoryDocument> =
  mongoose.models.History ?? mongoose.model<HistoryDocument>('History', historySchema);

// --- Environments ---

const envVariableSchema = new Schema(
  {
    id: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    secret: { type: Boolean, default: false },
  },
  { _id: false }
);

export type EnvironmentDocument = Document & Omit<Environment, 'id'>;

const environmentSchema = new Schema(
  {
    name: { type: String, required: true },
    variables: [envVariableSchema],
    defaultAuth: { type: authSchema, default: () => ({ type: 'none' }) },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const EnvironmentModel: Model<EnvironmentDocument> =
  mongoose.models.Environment ??
  mongoose.model<EnvironmentDocument>('Environment', environmentSchema);

// --- Users ---

const userSchema = new Schema(
  {
    clientId: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    avatarUrl: String,
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User ?? mongoose.model('User', userSchema);

// --- Sessions ---

const sessionSchema = new Schema(
  {
    token: { type: String, unique: true, required: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const SessionModel = mongoose.models.Session ?? mongoose.model('Session', sessionSchema);

// --- Teams ---

const teamSchema = new Schema(
  {
    clientId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: String,
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

export const TeamModel = mongoose.models.Team ?? mongoose.model('Team', teamSchema);

// --- Team Members ---

const teamMemberSchema = new Schema(
  {
    clientId: { type: String, unique: true, required: true },
    teamId: { type: String, required: true, index: true },
    userId: { type: String, index: true, sparse: true },
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    status: { type: String, enum: ['invited', 'active', 'declined'], default: 'active' },
    joinedAt: { type: String, required: true },
  },
  { timestamps: true }
);

teamMemberSchema.index({ teamId: 1, email: 1 }, { unique: true });

export const TeamMemberModel =
  mongoose.models.TeamMember ?? mongoose.model('TeamMember', teamMemberSchema);

// --- Projects ---

const projectSchema = new Schema(
  {
    clientId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: String,
    ownerId: { type: String, required: true, index: true },
    teamId: { type: String, index: true },
    isPersonal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.models.Project ?? mongoose.model('Project', projectSchema);

// --- Project Members ---

const projectMemberSchema = new Schema(
  {
    clientId: { type: String, unique: true, required: true },
    projectId: { type: String, required: true, index: true },
    userId: { type: String, index: true, sparse: true },
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    status: { type: String, enum: ['invited', 'active', 'declined'], default: 'active' },
    joinedAt: { type: String, required: true },
  },
  { timestamps: true }
);

projectMemberSchema.index({ projectId: 1, email: 1 }, { unique: true });

export const ProjectMemberModel =
  mongoose.models.ProjectMember ?? mongoose.model('ProjectMember', projectMemberSchema);
