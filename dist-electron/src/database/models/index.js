"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMemberModel = exports.ProjectModel = exports.TeamMemberModel = exports.TeamModel = exports.SessionModel = exports.UserModel = exports.EnvironmentModel = exports.HistoryModel = exports.RequestTabModel = exports.RequestModel = exports.CollectionModel = exports.SettingsModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// --- Sub-schemas ---
const keyValueSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    key: { type: String, default: '' },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
}, { _id: false });
const authSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['none', 'bearer', 'basic', 'api-key'], default: 'none' },
    bearerToken: String,
    basicUsername: String,
    basicPassword: String,
    apiKeyKey: String,
    apiKeyValue: String,
    apiKeyAddTo: { type: String, enum: ['header', 'query'] },
}, { _id: false });
const bodySchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['json', 'raw', 'form-data', 'x-www-form-urlencoded', 'graphql'],
        default: 'json',
    },
    content: { type: String, default: '' },
    formData: [keyValueSchema],
}, { _id: false });
const folderSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    parentId: String,
    children: { type: mongoose_1.Schema.Types.Mixed, default: [] },
    requestIds: { type: [String], default: [] },
}, { _id: false });
const settingsSchema = new mongoose_1.Schema({
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    timeout: { type: Number, default: 30000 },
    autoSave: { type: Boolean, default: true },
    defaultEnvironmentId: String,
    maxHistorySize: { type: Number, default: 10000 },
    sidebarCollapsed: { type: Boolean, default: false },
}, { timestamps: true });
exports.SettingsModel = mongoose_1.default.models.Settings ?? mongoose_1.default.model('Settings', settingsSchema);
const collectionSchema = new mongoose_1.Schema({
    clientId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    description: String,
    folders: [folderSchema],
    requestIds: { type: [String], default: [] },
    projectId: { type: String, index: true },
    ownerId: { type: String, index: true },
    teamId: { type: String, index: true },
}, { timestamps: true });
exports.CollectionModel = mongoose_1.default.models.Collection ??
    mongoose_1.default.model('Collection', collectionSchema);
const requestTestSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, default: '' },
    type: { type: String, enum: ['status', 'body_contains', 'response_time'], default: 'status' },
    expected: { type: String, default: '200' },
    enabled: { type: Boolean, default: true },
}, { _id: false });
const requestSchema = new mongoose_1.Schema({
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
    auth: { type: authSchema, default: () => ({ type: 'none' }) },
    tests: [requestTestSchema],
    exampleResponse: String,
    collectionId: String,
    folderId: String,
}, { timestamps: true });
requestSchema.index({ collectionId: 1 });
requestSchema.index({ name: 'text' });
exports.RequestModel = mongoose_1.default.models.Request ?? mongoose_1.default.model('Request', requestSchema);
const requestTabSchema = new mongoose_1.Schema({
    requestId: { type: String, required: true },
    order: { type: Number, default: 0 },
    isLoading: { type: Boolean, default: false },
    duration: Number,
    response: mongoose_1.Schema.Types.Mixed,
}, { timestamps: true });
exports.RequestTabModel = mongoose_1.default.models.RequestTab ??
    mongoose_1.default.model('RequestTab', requestTabSchema);
const historySchema = new mongoose_1.Schema({
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
    requestSnapshot: { type: mongoose_1.Schema.Types.Mixed, required: true },
}, { timestamps: true });
historySchema.index({ timestamp: -1 });
historySchema.index({ url: 'text', method: 1 });
exports.HistoryModel = mongoose_1.default.models.History ?? mongoose_1.default.model('History', historySchema);
// --- Environments ---
const envVariableSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    secret: { type: Boolean, default: false },
}, { _id: false });
const environmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    variables: [envVariableSchema],
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });
exports.EnvironmentModel = mongoose_1.default.models.Environment ??
    mongoose_1.default.model('Environment', environmentSchema);
// --- Users ---
const userSchema = new mongoose_1.Schema({
    clientId: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: String,
}, { timestamps: true });
exports.UserModel = mongoose_1.default.models.User ?? mongoose_1.default.model('User', userSchema);
// --- Sessions ---
const sessionSchema = new mongoose_1.Schema({
    token: { type: String, unique: true, required: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
exports.SessionModel = mongoose_1.default.models.Session ?? mongoose_1.default.model('Session', sessionSchema);
// --- Teams ---
const teamSchema = new mongoose_1.Schema({
    clientId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: String,
    ownerId: { type: String, required: true },
}, { timestamps: true });
exports.TeamModel = mongoose_1.default.models.Team ?? mongoose_1.default.model('Team', teamSchema);
// --- Team Members ---
const teamMemberSchema = new mongoose_1.Schema({
    clientId: { type: String, unique: true, required: true },
    teamId: { type: String, required: true, index: true },
    userId: { type: String, index: true, sparse: true },
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    status: { type: String, enum: ['invited', 'active', 'declined'], default: 'active' },
    joinedAt: { type: String, required: true },
}, { timestamps: true });
teamMemberSchema.index({ teamId: 1, email: 1 }, { unique: true });
exports.TeamMemberModel = mongoose_1.default.models.TeamMember ?? mongoose_1.default.model('TeamMember', teamMemberSchema);
// --- Projects ---
const projectSchema = new mongoose_1.Schema({
    clientId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: String,
    ownerId: { type: String, required: true, index: true },
    teamId: { type: String, index: true },
    isPersonal: { type: Boolean, default: false },
}, { timestamps: true });
exports.ProjectModel = mongoose_1.default.models.Project ?? mongoose_1.default.model('Project', projectSchema);
// --- Project Members ---
const projectMemberSchema = new mongoose_1.Schema({
    clientId: { type: String, unique: true, required: true },
    projectId: { type: String, required: true, index: true },
    userId: { type: String, index: true, sparse: true },
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    status: { type: String, enum: ['invited', 'active', 'declined'], default: 'active' },
    joinedAt: { type: String, required: true },
}, { timestamps: true });
projectMemberSchema.index({ projectId: 1, email: 1 }, { unique: true });
exports.ProjectMemberModel = mongoose_1.default.models.ProjectMember ?? mongoose_1.default.model('ProjectMember', projectMemberSchema);
