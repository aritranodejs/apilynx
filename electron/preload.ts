import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../src/types/electron-api';

const electronAPI: ElectronAPI = {
  sendRequest: (payload) => ipcRenderer.invoke('http:send', payload),
  cancelRequest: (signalId) => ipcRenderer.invoke('http:cancel', signalId),
  getSettings: () => ipcRenderer.invoke('db:getSettings'),
  updateSettings: (updates) => ipcRenderer.invoke('db:updateSettings', updates),
  getCollections: (projectId) => ipcRenderer.invoke('db:getCollections', projectId),
  createCollection: (name, description, projectId, ownerId, teamId) =>
    ipcRenderer.invoke('db:createCollection', name, description, projectId, ownerId, teamId),
  updateCollection: (id, updates) => ipcRenderer.invoke('db:updateCollection', id, updates),
  deleteCollection: (id) => ipcRenderer.invoke('db:deleteCollection', id),
  getRequest: (id) => ipcRenderer.invoke('db:getRequest', id),
  getRequestsByCollection: (collectionId) =>
    ipcRenderer.invoke('db:getRequestsByCollection', collectionId),
  saveRequest: (request) => ipcRenderer.invoke('db:saveRequest', request),
  deleteRequest: (id) => ipcRenderer.invoke('db:deleteRequest', id),
  createRequestInCollection: (collectionId, folderId, name) =>
    ipcRenderer.invoke('db:createRequestInCollection', collectionId, folderId, name),
  getHistory: (page, pageSize, search) => ipcRenderer.invoke('db:getHistory', page, pageSize, search),
  addHistory: (entry) => ipcRenderer.invoke('db:addHistory', entry),
  deleteHistory: (id) => ipcRenderer.invoke('db:deleteHistory', id),
  clearHistory: () => ipcRenderer.invoke('db:clearHistory'),
  getEnvironments: () => ipcRenderer.invoke('db:getEnvironments'),
  createEnvironment: (name) => ipcRenderer.invoke('db:createEnvironment', name),
  updateEnvironment: (id, updates) => ipcRenderer.invoke('db:updateEnvironment', id, updates),
  deleteEnvironment: (id) => ipcRenderer.invoke('db:deleteEnvironment', id),
  register: (payload) => ipcRenderer.invoke('auth:register', payload),
  login: (payload) => ipcRenderer.invoke('auth:login', payload),
  loginWithGoogle: () => ipcRenderer.invoke('auth:loginWithGoogle'),
  isGoogleConfigured: () => ipcRenderer.invoke('auth:isGoogleConfigured'),
  logout: (token) => ipcRenderer.invoke('auth:logout', token),
  getSession: (token) => ipcRenderer.invoke('auth:getSession', token),
  getProjects: (userId) => ipcRenderer.invoke('project:getAll', userId),
  createProject: (name, ownerId, teamId, description) =>
    ipcRenderer.invoke('project:create', name, ownerId, teamId, description),
  createPersonalProject: (ownerId, userName) =>
    ipcRenderer.invoke('project:createPersonal', ownerId, userName),
  getTeams: (userId) => ipcRenderer.invoke('team:getAll', userId),
  createTeam: (name, ownerId, ownerEmail, ownerName) =>
    ipcRenderer.invoke('team:create', name, ownerId, ownerEmail, ownerName),
  getTeamMembers: (teamId) => ipcRenderer.invoke('team:getMembers', teamId),
  addTeamMember: (teamId, email, role) => ipcRenderer.invoke('team:addMember', teamId, email, role),
  removeTeamMember: (teamId, memberId) => ipcRenderer.invoke('team:removeMember', teamId, memberId),
  updateProfile: (payload) => ipcRenderer.invoke('auth:updateProfile', payload),
  changePassword: (payload) => ipcRenderer.invoke('auth:changePassword', payload),
  updateProject: (projectId, updates) => ipcRenderer.invoke('project:update', projectId, updates),
  deleteProject: (projectId) => ipcRenderer.invoke('project:delete', projectId),
  inviteTeamToProject: (projectId, teamId) =>
    ipcRenderer.invoke('project:inviteTeam', projectId, teamId),
  getProjectMembers: (projectId) => ipcRenderer.invoke('project:getMembers', projectId),
  addProjectMember: (projectId, email, role) =>
    ipcRenderer.invoke('project:addMember', projectId, email, role),
  removeProjectMember: (projectId, memberId) =>
    ipcRenderer.invoke('project:removeMember', projectId, memberId),
  updateProjectMemberRole: (projectId, memberId, role) =>
    ipcRenderer.invoke('project:updateMemberRole', projectId, memberId, role),
  getPendingProjectInvites: (email) => ipcRenderer.invoke('invite:getPendingProjects', email),
  getPendingTeamInvites: (email) => ipcRenderer.invoke('invite:getPendingTeams', email),
  acceptProjectInvite: (memberId, userId, email) =>
    ipcRenderer.invoke('invite:acceptProject', memberId, userId, email),
  declineProjectInvite: (memberId, userId, email) =>
    ipcRenderer.invoke('invite:declineProject', memberId, userId, email),
  acceptTeamInvite: (memberId, userId, email) =>
    ipcRenderer.invoke('invite:acceptTeam', memberId, userId, email),
  declineTeamInvite: (memberId, userId, email) =>
    ipcRenderer.invoke('invite:declineTeam', memberId, userId, email),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  startMockServer: (port, routes) => ipcRenderer.invoke('mock:start', port, routes),
  stopMockServer: () => ipcRenderer.invoke('mock:stop'),
  getMockServerStatus: () => ipcRenderer.invoke('mock:status'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
