import bcrypt from 'bcryptjs';
import {
  ProjectMemberModel,
  ProjectModel,
  SessionModel,
  TeamMemberModel,
  TeamModel,
  UserModel,
} from '../models';
import type { AuthResponse, ChangePasswordPayload, LoginPayload, Project, ProjectInvite, ProjectMember, RegisterPayload, Team, TeamInvite, TeamMember, TeamRole, UpdateProfilePayload, UpdateProjectPayload, User } from '@/types';
import { generateId } from '@/lib/utils';
import { clientOrMongoIdFilter } from '@/lib/mongo-id';

const SESSION_DAYS = 30;

let activeToken: string | null = null;

function toPlain<T>(doc: unknown): T {
  const obj =
    typeof (doc as { toObject?: () => Record<string, unknown> }).toObject === 'function'
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : (doc as Record<string, unknown>);
  const { _id, __v, clientId, passwordHash, ...rest } = obj;
  const result = { ...rest, id: (clientId as string) || String(_id) } as Record<string, unknown>;
  if (result.status === undefined) result.status = 'active';
  if (result.status === 'pending') result.status = 'invited';
  return result as T;
}

async function createSession(userId: string): Promise<string> {
  const token = generateId() + generateId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  await SessionModel.create({ token, userId, expiresAt });
  activeToken = token;
  return token;
}

async function linkInvitesToUser(userId: string, email: string, name: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await ProjectMemberModel.updateMany(
    { email: normalizedEmail, status: 'invited' },
    { $set: { userId, name } }
  );
  await TeamMemberModel.updateMany(
    { email: normalizedEmail, status: 'invited' },
    { $set: { userId, name } }
  );
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const existing = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (existing) throw new Error('Email already registered');

  const clientId = generateId();
  const passwordHash = await bcrypt.hash(payload.password, 12);
  const doc = await UserModel.create({
    clientId,
    email: payload.email.toLowerCase(),
    passwordHash,
    name: payload.name,
  });
  const user = toPlain<User>(doc);
  const token = await createSession(user.id);

  await createPersonalProject(user.id, user.name, user.email);
  await linkInvitesToUser(user.id, user.email, user.name);

  return { user, token };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const doc = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (!doc) throw new Error('Invalid email or password');

  const valid = await bcrypt.compare(payload.password, doc.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  const user = toPlain<User>(doc);
  const token = await createSession(user.id);
  await linkInvitesToUser(user.id, user.email, user.name);
  return { user, token };
}

export async function logout(token: string): Promise<void> {
  await SessionModel.deleteOne({ token });
  if (activeToken === token) activeToken = null;
}

export async function getSessionUser(token: string): Promise<User | null> {
  const session = await SessionModel.findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await UserModel.findOne({ clientId: session.userId });
  if (!user) return null;
  activeToken = token;
  return toPlain<User>(user);
}

export async function createPersonalProject(
  ownerId: string,
  userName: string,
  ownerEmail = ''
): Promise<Project> {
  const existing = await ProjectModel.findOne({ ownerId, isPersonal: true });
  if (existing) {
    const memberCount = await ProjectMemberModel.countDocuments({ projectId: existing.clientId });
    if (memberCount === 0) {
      await ProjectMemberModel.create({
        clientId: generateId(),
        projectId: existing.clientId,
        userId: ownerId,
        email: ownerEmail,
        name: userName,
        role: 'owner',
        status: 'active',
        joinedAt: new Date().toISOString(),
      });
    }
    return toPlain<Project>(existing);
  }

  const projectId = generateId();
  const doc = await ProjectModel.create({
    clientId: projectId,
    name: `${userName}'s Workspace`,
    ownerId,
    isPersonal: true,
  });
  await ProjectMemberModel.create({
    clientId: generateId(),
    projectId,
    userId: ownerId,
    email: ownerEmail,
    name: userName,
    role: 'owner',
    status: 'active',
    joinedAt: new Date().toISOString(),
  });
  return toPlain<Project>(doc);
}

export async function getProjects(userId: string): Promise<Project[]> {
  const teamMemberships = await TeamMemberModel.find({ userId, status: 'active' }).lean();
  const teamIds = teamMemberships.map((m) => m.teamId);

  const projectMemberships = await ProjectMemberModel.find({ userId, status: 'active' }).lean();
  const projectIds = projectMemberships.map((m) => m.projectId);

  const docs = await ProjectModel.find({
    $or: [
      { ownerId: userId },
      { teamId: { $in: teamIds } },
      { clientId: { $in: projectIds } },
    ],
  }).sort({ updatedAt: -1 });

  return docs.map((d) => toPlain<Project>(d));
}

export async function createProject(
  name: string,
  ownerId: string,
  teamId?: string,
  description?: string
): Promise<Project> {
  const projectId = generateId();
  const owner = await UserModel.findOne({ clientId: ownerId });
  const doc = await ProjectModel.create({
    clientId: projectId,
    name,
    description,
    ownerId,
    teamId,
    isPersonal: false,
  });
  await ProjectMemberModel.create({
    clientId: generateId(),
    projectId,
    userId: ownerId,
    email: owner?.email ?? '',
    name: owner?.name ?? 'Owner',
    role: 'owner',
    status: 'active',
    joinedAt: new Date().toISOString(),
  });
  return toPlain<Project>(doc);
}

export async function getTeams(userId: string): Promise<Team[]> {
  const memberships = await TeamMemberModel.find({ userId, status: 'active' }).lean();
  const teamIds = memberships.map((m) => m.teamId);
  const docs = await TeamModel.find({
    $or: [{ ownerId: userId }, { clientId: { $in: teamIds } }],
  }).sort({ updatedAt: -1 });
  return docs.map((d) => toPlain<Team>(d));
}

export async function createTeam(name: string, ownerId: string, ownerEmail: string, ownerName: string): Promise<Team> {
  const teamId = generateId();
  const doc = await TeamModel.create({
    clientId: teamId,
    name,
    ownerId,
  });
  await TeamMemberModel.create({
    clientId: generateId(),
    teamId,
    userId: ownerId,
    email: ownerEmail,
    name: ownerName,
    role: 'owner',
    status: 'active',
    joinedAt: new Date().toISOString(),
  });
  return toPlain<Team>(doc);
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const docs = await TeamMemberModel.find({ teamId }).sort({ joinedAt: 1 });
  return docs.map((d) => toPlain<TeamMember>(d));
}

export async function addTeamMember(
  teamId: string,
  email: string,
  role: TeamRole = 'member'
): Promise<TeamMember> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Email is required');

  const existing = await TeamMemberModel.findOne({ teamId, email: normalizedEmail });
  if (existing) {
    if (existing.status === 'invited') throw new Error('Invitation already sent to this email');
    throw new Error('User is already a team member');
  }

  const user = await UserModel.findOne({ email: normalizedEmail });
  const now = new Date().toISOString();

  const doc = await TeamMemberModel.create({
    clientId: generateId(),
    teamId,
    userId: user?.clientId as string | undefined,
    email: normalizedEmail,
    name: user?.name ?? normalizedEmail.split('@')[0],
    role,
    status: 'invited',
    joinedAt: now,
  });
  return toPlain<TeamMember>(doc);
}

export async function removeTeamMember(teamId: string, memberId: string): Promise<boolean> {
  const result = await TeamMemberModel.findOneAndDelete({
    ...clientOrMongoIdFilter(memberId),
    teamId,
  });
  return !!result;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const doc = await UserModel.findOneAndUpdate(
    { clientId: payload.userId },
    {
      $set: {
        name: payload.name,
        ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl } : {}),
      },
    },
    { new: true }
  );
  if (!doc) throw new Error('User not found');
  return toPlain<User>(doc);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  const doc = await UserModel.findOne({ clientId: payload.userId });
  if (!doc) throw new Error('User not found');
  const valid = await bcrypt.compare(payload.currentPassword, doc.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');
  doc.passwordHash = await bcrypt.hash(payload.newPassword, 12);
  await doc.save();
}

export async function updateProject(
  projectId: string,
  updates: UpdateProjectPayload
): Promise<Project> {
  const doc = await ProjectModel.findOneAndUpdate(
    clientOrMongoIdFilter(projectId),
    { $set: updates },
    { new: true }
  );
  if (!doc) throw new Error('Project not found');
  return toPlain<Project>(doc);
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const result = await ProjectModel.findOneAndDelete({
    ...clientOrMongoIdFilter(projectId),
    isPersonal: false,
  });
  return !!result;
}

export async function inviteTeamToProject(projectId: string, teamId: string): Promise<Project> {
  const team = await TeamModel.findOne(clientOrMongoIdFilter(teamId));
  if (!team) throw new Error('Team not found');
  return updateProject(projectId, { teamId: team.clientId });
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const project = await ProjectModel.findOne(clientOrMongoIdFilter(projectId));
  if (!project) return [];
  const docs = await ProjectMemberModel.find({ projectId: project.clientId }).sort({ joinedAt: 1 });
  return docs.map((d) => toPlain<ProjectMember>(d));
}

export async function addProjectMember(
  projectId: string,
  email: string,
  role: TeamRole = 'member'
): Promise<ProjectMember> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Email is required');

  const project = await ProjectModel.findOne(clientOrMongoIdFilter(projectId));
  if (!project) throw new Error('Project not found');

  const existing = await ProjectMemberModel.findOne({
    projectId: project.clientId,
    email: normalizedEmail,
  });
  if (existing) {
    if (existing.status === 'invited') throw new Error('Invitation already sent to this email');
    throw new Error('User is already a member of this workspace');
  }

  const user = await UserModel.findOne({ email: normalizedEmail });
  const now = new Date().toISOString();

  if (user?.clientId === project.ownerId) throw new Error('Owner is already in this workspace');

  const doc = await ProjectMemberModel.create({
    clientId: generateId(),
    projectId: project.clientId,
    userId: user?.clientId as string | undefined,
    email: normalizedEmail,
    name: user?.name ?? normalizedEmail.split('@')[0],
    role,
    status: 'invited',
    joinedAt: now,
  });
  return toPlain<ProjectMember>(doc);
}

export async function removeProjectMember(projectId: string, memberId: string): Promise<boolean> {
  const project = await ProjectModel.findOne(clientOrMongoIdFilter(projectId));
  if (!project) return false;
  const pid = project.clientId as string;

  const member = await ProjectMemberModel.findOne({
    ...clientOrMongoIdFilter(memberId),
    projectId: pid,
  });
  if (!member) return false;
  if (member.role === 'owner') throw new Error('Cannot remove the workspace owner');

  const result = await ProjectMemberModel.findOneAndDelete({
    ...clientOrMongoIdFilter(memberId),
    projectId: pid,
  });
  return !!result;
}

export async function updateProjectMemberRole(
  projectId: string,
  memberId: string,
  role: TeamRole
): Promise<ProjectMember> {
  if (role === 'owner') throw new Error('Cannot assign owner role via invite');
  const project = await ProjectModel.findOne(clientOrMongoIdFilter(projectId));
  if (!project) throw new Error('Project not found');

  const doc = await ProjectMemberModel.findOneAndUpdate(
    { ...clientOrMongoIdFilter(memberId), projectId: project.clientId },
    { $set: { role } },
    { new: true }
  );
  if (!doc) throw new Error('Member not found');
  return toPlain<ProjectMember>(doc);
}

export function setActiveToken(token: string | null): void {
  activeToken = token;
}

export function getActiveToken(): string | null {
  return activeToken;
}

export async function getPendingProjectInvites(email: string): Promise<ProjectInvite[]> {
  const normalizedEmail = email.toLowerCase().trim();
  const docs = await ProjectMemberModel.find({ email: normalizedEmail, status: 'invited' }).sort({
    joinedAt: -1,
  });
  const result: ProjectInvite[] = [];
  for (const doc of docs) {
    const project = await ProjectModel.findOne({ clientId: doc.projectId });
    result.push({
      ...toPlain<ProjectMember>(doc),
      projectName: project?.name ?? 'Workspace',
    });
  }
  return result;
}

export async function getPendingTeamInvites(email: string): Promise<TeamInvite[]> {
  const normalizedEmail = email.toLowerCase().trim();
  const docs = await TeamMemberModel.find({ email: normalizedEmail, status: 'invited' }).sort({
    joinedAt: -1,
  });
  const result: TeamInvite[] = [];
  for (const doc of docs) {
    const team = await TeamModel.findOne({ clientId: doc.teamId });
    result.push({
      ...toPlain<TeamMember>(doc),
      teamName: team?.name ?? 'Team',
    });
  }
  return result;
}

async function verifyInvitee(
  memberEmail: string,
  memberUserId: string | undefined,
  userId: string,
  email: string
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  return (
    memberEmail.toLowerCase() === normalizedEmail ||
    (!!memberUserId && memberUserId === userId)
  );
}

export async function acceptProjectInvite(
  memberId: string,
  userId: string,
  email: string
): Promise<ProjectMember> {
  const member = await ProjectMemberModel.findOne(clientOrMongoIdFilter(memberId));
  if (!member || member.status !== 'invited') throw new Error('Invitation not found');
  if (!verifyInvitee(member.email, member.userId, userId, email)) {
    throw new Error('This invitation is not for you');
  }
  const doc = await ProjectMemberModel.findOneAndUpdate(
    { _id: member._id },
    { $set: { userId, status: 'active', joinedAt: new Date().toISOString() } },
    { new: true }
  );
  return toPlain<ProjectMember>(doc!);
}

export async function declineProjectInvite(
  memberId: string,
  userId: string,
  email: string
): Promise<boolean> {
  const member = await ProjectMemberModel.findOne(clientOrMongoIdFilter(memberId));
  if (!member || member.status !== 'invited') return false;
  if (!verifyInvitee(member.email, member.userId, userId, email)) {
    throw new Error('This invitation is not for you');
  }
  await ProjectMemberModel.findOneAndUpdate(
    { _id: member._id },
    { $set: { status: 'declined' } }
  );
  return true;
}

export async function acceptTeamInvite(
  memberId: string,
  userId: string,
  email: string
): Promise<TeamMember> {
  const member = await TeamMemberModel.findOne(clientOrMongoIdFilter(memberId));
  if (!member || member.status !== 'invited') throw new Error('Invitation not found');
  if (!verifyInvitee(member.email, member.userId, userId, email)) {
    throw new Error('This invitation is not for you');
  }
  const doc = await TeamMemberModel.findOneAndUpdate(
    { _id: member._id },
    { $set: { userId, status: 'active', joinedAt: new Date().toISOString() } },
    { new: true }
  );
  return toPlain<TeamMember>(doc!);
}

export async function declineTeamInvite(
  memberId: string,
  userId: string,
  email: string
): Promise<boolean> {
  const member = await TeamMemberModel.findOne(clientOrMongoIdFilter(memberId));
  if (!member || member.status !== 'invited') return false;
  if (!verifyInvitee(member.email, member.userId, userId, email)) {
    throw new Error('This invitation is not for you');
  }
  await TeamMemberModel.findOneAndUpdate({ _id: member._id }, { $set: { status: 'declined' } });
  return true;
}
