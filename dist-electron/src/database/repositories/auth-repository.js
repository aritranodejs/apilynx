"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getSessionUser = getSessionUser;
exports.createPersonalProject = createPersonalProject;
exports.getProjects = getProjects;
exports.createProject = createProject;
exports.getTeams = getTeams;
exports.createTeam = createTeam;
exports.getTeamMembers = getTeamMembers;
exports.addTeamMember = addTeamMember;
exports.removeTeamMember = removeTeamMember;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.inviteTeamToProject = inviteTeamToProject;
exports.getProjectMembers = getProjectMembers;
exports.addProjectMember = addProjectMember;
exports.removeProjectMember = removeProjectMember;
exports.updateProjectMemberRole = updateProjectMemberRole;
exports.setActiveToken = setActiveToken;
exports.getActiveToken = getActiveToken;
exports.getPendingProjectInvites = getPendingProjectInvites;
exports.getPendingTeamInvites = getPendingTeamInvites;
exports.acceptProjectInvite = acceptProjectInvite;
exports.declineProjectInvite = declineProjectInvite;
exports.acceptTeamInvite = acceptTeamInvite;
exports.declineTeamInvite = declineTeamInvite;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = require("../models/index.js");
const utils_1 = require("../../lib/utils.js");
const mongo_id_1 = require("../../lib/mongo-id.js");
const SESSION_DAYS = 30;
let activeToken = null;
function toPlain(doc) {
    const obj = typeof doc.toObject === 'function'
        ? doc.toObject()
        : doc;
    const { _id, __v, clientId, passwordHash, ...rest } = obj;
    const result = { ...rest, id: clientId || String(_id) };
    if (result.status === undefined)
        result.status = 'active';
    if (result.status === 'pending')
        result.status = 'invited';
    return result;
}
async function createSession(userId) {
    const token = (0, utils_1.generateId)() + (0, utils_1.generateId)();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
    await models_1.SessionModel.create({ token, userId, expiresAt });
    activeToken = token;
    return token;
}
async function linkInvitesToUser(userId, email, name) {
    const normalizedEmail = email.toLowerCase().trim();
    await models_1.ProjectMemberModel.updateMany({ email: normalizedEmail, status: 'invited' }, { $set: { userId, name } });
    await models_1.TeamMemberModel.updateMany({ email: normalizedEmail, status: 'invited' }, { $set: { userId, name } });
}
async function register(payload) {
    const existing = await models_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existing)
        throw new Error('Email already registered');
    const clientId = (0, utils_1.generateId)();
    const passwordHash = await bcryptjs_1.default.hash(payload.password, 12);
    const doc = await models_1.UserModel.create({
        clientId,
        email: payload.email.toLowerCase(),
        passwordHash,
        name: payload.name,
    });
    const user = toPlain(doc);
    const token = await createSession(user.id);
    await createPersonalProject(user.id, user.name, user.email);
    await linkInvitesToUser(user.id, user.email, user.name);
    return { user, token };
}
async function login(payload) {
    const doc = await models_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (!doc)
        throw new Error('Invalid email or password');
    const valid = await bcryptjs_1.default.compare(payload.password, doc.passwordHash);
    if (!valid)
        throw new Error('Invalid email or password');
    const user = toPlain(doc);
    const token = await createSession(user.id);
    await linkInvitesToUser(user.id, user.email, user.name);
    return { user, token };
}
async function logout(token) {
    await models_1.SessionModel.deleteOne({ token });
    if (activeToken === token)
        activeToken = null;
}
async function getSessionUser(token) {
    const session = await models_1.SessionModel.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!session)
        return null;
    const user = await models_1.UserModel.findOne({ clientId: session.userId });
    if (!user)
        return null;
    activeToken = token;
    return toPlain(user);
}
async function createPersonalProject(ownerId, userName, ownerEmail = '') {
    const existing = await models_1.ProjectModel.findOne({ ownerId, isPersonal: true });
    if (existing) {
        const memberCount = await models_1.ProjectMemberModel.countDocuments({ projectId: existing.clientId });
        if (memberCount === 0) {
            await models_1.ProjectMemberModel.create({
                clientId: (0, utils_1.generateId)(),
                projectId: existing.clientId,
                userId: ownerId,
                email: ownerEmail,
                name: userName,
                role: 'owner',
                status: 'active',
                joinedAt: new Date().toISOString(),
            });
        }
        return toPlain(existing);
    }
    const projectId = (0, utils_1.generateId)();
    const doc = await models_1.ProjectModel.create({
        clientId: projectId,
        name: `${userName}'s Workspace`,
        ownerId,
        isPersonal: true,
    });
    await models_1.ProjectMemberModel.create({
        clientId: (0, utils_1.generateId)(),
        projectId,
        userId: ownerId,
        email: ownerEmail,
        name: userName,
        role: 'owner',
        status: 'active',
        joinedAt: new Date().toISOString(),
    });
    return toPlain(doc);
}
async function getProjects(userId) {
    const teamMemberships = await models_1.TeamMemberModel.find({ userId, status: 'active' }).lean();
    const teamIds = teamMemberships.map((m) => m.teamId);
    const projectMemberships = await models_1.ProjectMemberModel.find({ userId, status: 'active' }).lean();
    const projectIds = projectMemberships.map((m) => m.projectId);
    const docs = await models_1.ProjectModel.find({
        $or: [
            { ownerId: userId },
            { teamId: { $in: teamIds } },
            { clientId: { $in: projectIds } },
        ],
    }).sort({ updatedAt: -1 });
    return docs.map((d) => toPlain(d));
}
async function createProject(name, ownerId, teamId, description) {
    const projectId = (0, utils_1.generateId)();
    const owner = await models_1.UserModel.findOne({ clientId: ownerId });
    const doc = await models_1.ProjectModel.create({
        clientId: projectId,
        name,
        description,
        ownerId,
        teamId,
        isPersonal: false,
    });
    await models_1.ProjectMemberModel.create({
        clientId: (0, utils_1.generateId)(),
        projectId,
        userId: ownerId,
        email: owner?.email ?? '',
        name: owner?.name ?? 'Owner',
        role: 'owner',
        status: 'active',
        joinedAt: new Date().toISOString(),
    });
    return toPlain(doc);
}
async function getTeams(userId) {
    const memberships = await models_1.TeamMemberModel.find({ userId, status: 'active' }).lean();
    const teamIds = memberships.map((m) => m.teamId);
    const docs = await models_1.TeamModel.find({
        $or: [{ ownerId: userId }, { clientId: { $in: teamIds } }],
    }).sort({ updatedAt: -1 });
    return docs.map((d) => toPlain(d));
}
async function createTeam(name, ownerId, ownerEmail, ownerName) {
    const teamId = (0, utils_1.generateId)();
    const doc = await models_1.TeamModel.create({
        clientId: teamId,
        name,
        ownerId,
    });
    await models_1.TeamMemberModel.create({
        clientId: (0, utils_1.generateId)(),
        teamId,
        userId: ownerId,
        email: ownerEmail,
        name: ownerName,
        role: 'owner',
        status: 'active',
        joinedAt: new Date().toISOString(),
    });
    return toPlain(doc);
}
async function getTeamMembers(teamId) {
    const docs = await models_1.TeamMemberModel.find({ teamId }).sort({ joinedAt: 1 });
    return docs.map((d) => toPlain(d));
}
async function addTeamMember(teamId, email, role = 'member') {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail)
        throw new Error('Email is required');
    const existing = await models_1.TeamMemberModel.findOne({ teamId, email: normalizedEmail });
    if (existing) {
        if (existing.status === 'invited')
            throw new Error('Invitation already sent to this email');
        throw new Error('User is already a team member');
    }
    const user = await models_1.UserModel.findOne({ email: normalizedEmail });
    const now = new Date().toISOString();
    const doc = await models_1.TeamMemberModel.create({
        clientId: (0, utils_1.generateId)(),
        teamId,
        userId: user?.clientId,
        email: normalizedEmail,
        name: user?.name ?? normalizedEmail.split('@')[0],
        role,
        status: 'invited',
        joinedAt: now,
    });
    return toPlain(doc);
}
async function removeTeamMember(teamId, memberId) {
    const result = await models_1.TeamMemberModel.findOneAndDelete({
        ...(0, mongo_id_1.clientOrMongoIdFilter)(memberId),
        teamId,
    });
    return !!result;
}
async function updateProfile(payload) {
    const doc = await models_1.UserModel.findOneAndUpdate({ clientId: payload.userId }, {
        $set: {
            name: payload.name,
            ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl } : {}),
        },
    }, { new: true });
    if (!doc)
        throw new Error('User not found');
    return toPlain(doc);
}
async function changePassword(payload) {
    const doc = await models_1.UserModel.findOne({ clientId: payload.userId });
    if (!doc)
        throw new Error('User not found');
    const valid = await bcryptjs_1.default.compare(payload.currentPassword, doc.passwordHash);
    if (!valid)
        throw new Error('Current password is incorrect');
    doc.passwordHash = await bcryptjs_1.default.hash(payload.newPassword, 12);
    await doc.save();
}
async function updateProject(projectId, updates) {
    const doc = await models_1.ProjectModel.findOneAndUpdate((0, mongo_id_1.clientOrMongoIdFilter)(projectId), { $set: updates }, { new: true });
    if (!doc)
        throw new Error('Project not found');
    return toPlain(doc);
}
async function deleteProject(projectId) {
    const result = await models_1.ProjectModel.findOneAndDelete({
        ...(0, mongo_id_1.clientOrMongoIdFilter)(projectId),
        isPersonal: false,
    });
    return !!result;
}
async function inviteTeamToProject(projectId, teamId) {
    const team = await models_1.TeamModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(teamId));
    if (!team)
        throw new Error('Team not found');
    return updateProject(projectId, { teamId: team.clientId });
}
async function getProjectMembers(projectId) {
    const project = await models_1.ProjectModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(projectId));
    if (!project)
        return [];
    const docs = await models_1.ProjectMemberModel.find({ projectId: project.clientId }).sort({ joinedAt: 1 });
    return docs.map((d) => toPlain(d));
}
async function addProjectMember(projectId, email, role = 'member') {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail)
        throw new Error('Email is required');
    const project = await models_1.ProjectModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(projectId));
    if (!project)
        throw new Error('Project not found');
    const existing = await models_1.ProjectMemberModel.findOne({
        projectId: project.clientId,
        email: normalizedEmail,
    });
    if (existing) {
        if (existing.status === 'invited')
            throw new Error('Invitation already sent to this email');
        throw new Error('User is already a member of this workspace');
    }
    const user = await models_1.UserModel.findOne({ email: normalizedEmail });
    const now = new Date().toISOString();
    if (user?.clientId === project.ownerId)
        throw new Error('Owner is already in this workspace');
    const doc = await models_1.ProjectMemberModel.create({
        clientId: (0, utils_1.generateId)(),
        projectId: project.clientId,
        userId: user?.clientId,
        email: normalizedEmail,
        name: user?.name ?? normalizedEmail.split('@')[0],
        role,
        status: 'invited',
        joinedAt: now,
    });
    return toPlain(doc);
}
async function removeProjectMember(projectId, memberId) {
    const project = await models_1.ProjectModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(projectId));
    if (!project)
        return false;
    const pid = project.clientId;
    const member = await models_1.ProjectMemberModel.findOne({
        ...(0, mongo_id_1.clientOrMongoIdFilter)(memberId),
        projectId: pid,
    });
    if (!member)
        return false;
    if (member.role === 'owner')
        throw new Error('Cannot remove the workspace owner');
    const result = await models_1.ProjectMemberModel.findOneAndDelete({
        ...(0, mongo_id_1.clientOrMongoIdFilter)(memberId),
        projectId: pid,
    });
    return !!result;
}
async function updateProjectMemberRole(projectId, memberId, role) {
    if (role === 'owner')
        throw new Error('Cannot assign owner role via invite');
    const project = await models_1.ProjectModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(projectId));
    if (!project)
        throw new Error('Project not found');
    const doc = await models_1.ProjectMemberModel.findOneAndUpdate({ ...(0, mongo_id_1.clientOrMongoIdFilter)(memberId), projectId: project.clientId }, { $set: { role } }, { new: true });
    if (!doc)
        throw new Error('Member not found');
    return toPlain(doc);
}
function setActiveToken(token) {
    activeToken = token;
}
function getActiveToken() {
    return activeToken;
}
async function getPendingProjectInvites(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const docs = await models_1.ProjectMemberModel.find({ email: normalizedEmail, status: 'invited' }).sort({
        joinedAt: -1,
    });
    const result = [];
    for (const doc of docs) {
        const project = await models_1.ProjectModel.findOne({ clientId: doc.projectId });
        result.push({
            ...toPlain(doc),
            projectName: project?.name ?? 'Workspace',
        });
    }
    return result;
}
async function getPendingTeamInvites(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const docs = await models_1.TeamMemberModel.find({ email: normalizedEmail, status: 'invited' }).sort({
        joinedAt: -1,
    });
    const result = [];
    for (const doc of docs) {
        const team = await models_1.TeamModel.findOne({ clientId: doc.teamId });
        result.push({
            ...toPlain(doc),
            teamName: team?.name ?? 'Team',
        });
    }
    return result;
}
async function verifyInvitee(memberEmail, memberUserId, userId, email) {
    const normalizedEmail = email.toLowerCase().trim();
    return (memberEmail.toLowerCase() === normalizedEmail ||
        (!!memberUserId && memberUserId === userId));
}
async function acceptProjectInvite(memberId, userId, email) {
    const member = await models_1.ProjectMemberModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(memberId));
    if (!member || member.status !== 'invited')
        throw new Error('Invitation not found');
    if (!verifyInvitee(member.email, member.userId, userId, email)) {
        throw new Error('This invitation is not for you');
    }
    const doc = await models_1.ProjectMemberModel.findOneAndUpdate({ _id: member._id }, { $set: { userId, status: 'active', joinedAt: new Date().toISOString() } }, { new: true });
    return toPlain(doc);
}
async function declineProjectInvite(memberId, userId, email) {
    const member = await models_1.ProjectMemberModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(memberId));
    if (!member || member.status !== 'invited')
        return false;
    if (!verifyInvitee(member.email, member.userId, userId, email)) {
        throw new Error('This invitation is not for you');
    }
    await models_1.ProjectMemberModel.findOneAndUpdate({ _id: member._id }, { $set: { status: 'declined' } });
    return true;
}
async function acceptTeamInvite(memberId, userId, email) {
    const member = await models_1.TeamMemberModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(memberId));
    if (!member || member.status !== 'invited')
        throw new Error('Invitation not found');
    if (!verifyInvitee(member.email, member.userId, userId, email)) {
        throw new Error('This invitation is not for you');
    }
    const doc = await models_1.TeamMemberModel.findOneAndUpdate({ _id: member._id }, { $set: { userId, status: 'active', joinedAt: new Date().toISOString() } }, { new: true });
    return toPlain(doc);
}
async function declineTeamInvite(memberId, userId, email) {
    const member = await models_1.TeamMemberModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(memberId));
    if (!member || member.status !== 'invited')
        return false;
    if (!verifyInvitee(member.email, member.userId, userId, email)) {
        throw new Error('This invitation is not for you');
    }
    await models_1.TeamMemberModel.findOneAndUpdate({ _id: member._id }, { $set: { status: 'declined' } });
    return true;
}
