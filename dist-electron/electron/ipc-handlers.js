"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbHandlers = void 0;
exports.initializeDatabase = initializeDatabase;
exports.shutdownDatabase = shutdownDatabase;
exports.handleSendRequest = handleSendRequest;
exports.handleCancelRequest = handleCancelRequest;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../src/lib/utils.js");
const repositories_1 = require("../src/database/repositories/index.js");
const auth_repository_1 = require("../src/database/repositories/auth-repository.js");
const mock_server_1 = require("./mock-server.js");
const activeRequests = new Map();
async function initializeDatabase() {
    await (0, repositories_1.connectDatabase)();
}
async function shutdownDatabase() {
    activeRequests.forEach((controller) => controller.abort());
    activeRequests.clear();
    await (0, repositories_1.disconnectDatabase)();
}
async function handleSendRequest(_event, payload) {
    const controller = new AbortController();
    activeRequests.set(payload.signalId, controller);
    const start = Date.now();
    try {
        let response;
        const config = {
            method: payload.method.toLowerCase(),
            url: (0, utils_1.normalizeRequestUrl)(payload.url),
            headers: payload.headers,
            timeout: payload.timeout,
            signal: controller.signal,
            validateStatus: () => true,
            responseType: 'text',
            maxContentLength: 50 * 1024 * 1024,
            maxBodyLength: 50 * 1024 * 1024,
        };
        const canHaveBody = (0, utils_1.methodAllowsBody)(payload.method);
        if (canHaveBody && payload.body !== undefined && payload.bodyType !== 'form-data') {
            response = await (0, axios_1.default)({ ...config, data: payload.body });
        }
        else if (canHaveBody && payload.bodyType === 'form-data' && payload.body instanceof FormData) {
            const formHeaders = { ...payload.headers };
            delete formHeaders['Content-Type'];
            response = await (0, axios_1.default)({ ...config, headers: formHeaders, data: payload.body });
        }
        else {
            response = await (0, axios_1.default)(config);
        }
        const duration = Date.now() - start;
        const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const size = new TextEncoder().encode(body).length;
        const headers = {};
        Object.entries(response.headers).forEach(([key, value]) => {
            if (typeof value === 'string')
                headers[key] = value;
            else if (Array.isArray(value))
                headers[key] = value.join(', ');
        });
        return {
            status: response.status,
            statusText: response.statusText,
            headers,
            body,
            size,
            duration,
        };
    }
    catch (error) {
        const duration = Date.now() - start;
        if (axios_1.default.isCancel(error)) {
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
    }
    finally {
        activeRequests.delete(payload.signalId);
    }
}
function handleCancelRequest(_event, signalId) {
    const controller = activeRequests.get(signalId);
    if (controller) {
        controller.abort();
        activeRequests.delete(signalId);
    }
}
// Database IPC handlers
exports.dbHandlers = {
    'db:getSettings': async () => (0, repositories_1.getSettings)(),
    'db:updateSettings': async (_e, updates) => (0, repositories_1.updateSettings)(updates),
    'db:getCollections': async (_e, projectId) => (0, repositories_1.getCollections)(projectId),
    'db:createCollection': async (_e, name, description, projectId, ownerId, teamId) => (0, repositories_1.createCollection)(name, description, projectId, ownerId, teamId),
    'db:updateCollection': async (_e, id, updates) => (0, repositories_1.updateCollection)(id, updates),
    'db:deleteCollection': async (_e, id) => (0, repositories_1.deleteCollection)(id),
    'db:getRequest': async (_e, id) => (0, repositories_1.getRequest)(id),
    'db:getRequestsByCollection': async (_e, collectionId) => (0, repositories_1.getRequestsByCollection)(collectionId),
    'db:saveRequest': async (_e, request) => (0, repositories_1.saveRequest)(request),
    'db:deleteRequest': async (_e, id) => (0, repositories_1.deleteRequest)(id),
    'db:createRequestInCollection': async (_e, collectionId, folderId, name) => (0, repositories_1.createRequestInCollection)(collectionId, folderId, name),
    'db:getHistory': async (_e, page, pageSize, search) => (0, repositories_1.getHistory)(page, pageSize, search),
    'db:addHistory': async (_e, entry) => (0, repositories_1.addHistoryEntry)(entry),
    'db:deleteHistory': async (_e, id) => (0, repositories_1.deleteHistoryEntry)(id),
    'db:clearHistory': async () => (0, repositories_1.clearHistory)(),
    'db:getEnvironments': async () => (0, repositories_1.getEnvironments)(),
    'db:createEnvironment': async (_e, name) => (0, repositories_1.createEnvironment)(name),
    'db:updateEnvironment': async (_e, id, updates) => (0, repositories_1.updateEnvironment)(id, updates),
    'db:deleteEnvironment': async (_e, id) => (0, repositories_1.deleteEnvironment)(id),
    // Auth
    'auth:register': async (_e, payload) => (0, auth_repository_1.register)(payload),
    'auth:login': async (_e, payload) => (0, auth_repository_1.login)(payload),
    'auth:logout': async (_e, token) => (0, auth_repository_1.logout)(token),
    'auth:getSession': async (_e, token) => (0, auth_repository_1.getSessionUser)(token),
    // Projects
    'project:getAll': async (_e, userId) => (0, auth_repository_1.getProjects)(userId),
    'project:create': async (_e, name, ownerId, teamId, description) => (0, auth_repository_1.createProject)(name, ownerId, teamId, description),
    'project:createPersonal': async (_e, ownerId, userName) => (0, auth_repository_1.createPersonalProject)(ownerId, userName),
    // Teams
    'team:getAll': async (_e, userId) => (0, auth_repository_1.getTeams)(userId),
    'team:create': async (_e, name, ownerId, ownerEmail, ownerName) => (0, auth_repository_1.createTeam)(name, ownerId, ownerEmail, ownerName),
    'team:getMembers': async (_e, teamId) => (0, auth_repository_1.getTeamMembers)(teamId),
    'team:addMember': async (_e, teamId, email, role) => (0, auth_repository_1.addTeamMember)(teamId, email, role),
    'team:removeMember': async (_e, teamId, memberId) => (0, auth_repository_1.removeTeamMember)(teamId, memberId),
    'auth:updateProfile': async (_e, payload) => (0, auth_repository_1.updateProfile)(payload),
    'auth:changePassword': async (_e, payload) => (0, auth_repository_1.changePassword)(payload),
    'project:update': async (_e, projectId, updates) => (0, auth_repository_1.updateProject)(projectId, updates),
    'project:delete': async (_e, projectId) => (0, auth_repository_1.deleteProject)(projectId),
    'project:inviteTeam': async (_e, projectId, teamId) => (0, auth_repository_1.inviteTeamToProject)(projectId, teamId),
    'project:getMembers': async (_e, projectId) => (0, auth_repository_1.getProjectMembers)(projectId),
    'project:addMember': async (_e, projectId, email, role) => (0, auth_repository_1.addProjectMember)(projectId, email, role),
    'project:removeMember': async (_e, projectId, memberId) => (0, auth_repository_1.removeProjectMember)(projectId, memberId),
    'project:updateMemberRole': async (_e, projectId, memberId, role) => (0, auth_repository_1.updateProjectMemberRole)(projectId, memberId, role),
    'invite:getPendingProjects': async (_e, email) => (0, auth_repository_1.getPendingProjectInvites)(email),
    'invite:getPendingTeams': async (_e, email) => (0, auth_repository_1.getPendingTeamInvites)(email),
    'invite:acceptProject': async (_e, memberId, userId, email) => (0, auth_repository_1.acceptProjectInvite)(memberId, userId, email),
    'invite:declineProject': async (_e, memberId, userId, email) => (0, auth_repository_1.declineProjectInvite)(memberId, userId, email),
    'invite:acceptTeam': async (_e, memberId, userId, email) => (0, auth_repository_1.acceptTeamInvite)(memberId, userId, email),
    'invite:declineTeam': async (_e, memberId, userId, email) => (0, auth_repository_1.declineTeamInvite)(memberId, userId, email),
    'mock:start': async (_e, port, routes) => (0, mock_server_1.startMockServer)(port, routes),
    'mock:stop': async () => {
        (0, mock_server_1.stopMockServer)();
    },
    'mock:status': async () => (0, mock_server_1.getMockServerStatus)(),
};
