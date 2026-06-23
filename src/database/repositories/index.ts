import mongoose from 'mongoose';
import {
  CollectionModel,
  EnvironmentModel,
  HistoryModel,
  ProjectMemberModel,
  RequestModel,
  RequestTabModel,
  SettingsModel,
  TeamMemberModel,
} from '../models';
import type {
  ApiRequest,
  AppSettings,
  Collection,
  Environment,
  HistoryEntry,
  PaginatedResult,
} from '@/types';
import { createDefaultRequest, generateId } from '@/lib/utils';
import { clientOrMongoIdFilter } from '@/lib/mongo-id';

const DEFAULT_MONGO_URI =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/apilynx';

let isConnected = false;

export async function connectDatabase(uri = DEFAULT_MONGO_URI): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(uri);
  isConnected = true;
  await migrateLegacyIndexes();
  await seedDefaults();
}

/** Drop obsolete unique indexes that break multiple pending invites (userId: null). */
async function migrateLegacyIndexes(): Promise<void> {
  const legacyIndexNames = ['projectId_1_userId_1', 'teamId_1_userId_1'];
  for (const model of [ProjectMemberModel, TeamMemberModel]) {
    try {
      const indexes = await model.collection.indexes();
      for (const idx of indexes) {
        if (idx.name && legacyIndexNames.includes(idx.name)) {
          await model.collection.dropIndex(idx.name);
        }
      }
      await model.syncIndexes();
    } catch (error) {
      console.warn(`Index migration for ${model.modelName}:`, error);
    }
  }
}

async function seedDefaults(): Promise<void> {
  const settingsCount = await SettingsModel.countDocuments();
  if (settingsCount === 0) {
    await SettingsModel.create({
      theme: 'dark',
      timeout: 30000,
      autoSave: true,
      maxHistorySize: 10000,
      sidebarCollapsed: false,
    });
  }

  // Environments are created by the user — no seeded mock variables.
}

function toPlain<T>(doc: unknown): T {
  const obj =
    typeof (doc as { toObject?: () => Record<string, unknown> }).toObject === 'function'
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : (doc as Record<string, unknown>);
  const { _id, __v, clientId, ...rest } = obj;
  return { ...rest, id: (clientId as string) || String(_id) } as T;
}

// --- Settings Repository ---

export async function getSettings(): Promise<AppSettings> {
  const doc = await SettingsModel.findOne().lean();
  if (!doc) {
    const created = await SettingsModel.create({});
    return toPlain<AppSettings>(created.toObject());
  }
  return toPlain<AppSettings>(doc);
}

export async function updateSettings(
  updates: Partial<Omit<AppSettings, 'id'>>
): Promise<AppSettings> {
  const doc = await SettingsModel.findOneAndUpdate({}, { $set: updates }, { new: true, upsert: true });
  return toPlain<AppSettings>(doc!);
}

// --- Collection Repository ---

export async function getCollections(projectId?: string): Promise<Collection[]> {
  const filter = projectId ? { projectId } : {};
  const docs = await CollectionModel.find(filter).sort({ updatedAt: -1 }).lean();
  return docs.map((d) => toPlain<Collection>(d));
}

export async function createCollection(
  name: string,
  description?: string,
  projectId?: string,
  ownerId?: string,
  teamId?: string
): Promise<Collection> {
  const doc = await CollectionModel.create({
    clientId: generateId(),
    name,
    description,
    folders: [],
    requestIds: [],
    projectId,
    ownerId,
    teamId,
  });
  return toPlain<Collection>(doc);
}

export async function updateCollection(
  id: string,
  updates: Partial<Pick<Collection, 'name' | 'description' | 'folders' | 'requestIds'>>
): Promise<Collection | null> {
  const doc = await CollectionModel.findOneAndUpdate(
    clientOrMongoIdFilter(id),
    { $set: updates },
    { new: true }
  );
  return doc ? toPlain<Collection>(doc) : null;
}

export async function deleteCollection(id: string): Promise<boolean> {
  await RequestModel.deleteMany({ $or: [{ collectionId: id }] });
  const result = await CollectionModel.findOneAndDelete(clientOrMongoIdFilter(id));
  return !!result;
}

// --- Request Repository ---

export async function getRequest(id: string): Promise<ApiRequest | null> {
  const doc = await RequestModel.findOne(clientOrMongoIdFilter(id)).lean();
  return doc ? toPlain<ApiRequest>(doc) : null;
}

export async function getRequestsByCollection(collectionId: string): Promise<ApiRequest[]> {
  const docs = await RequestModel.find({ collectionId }).sort({ updatedAt: -1 }).lean();
  return docs.map((d) => toPlain<ApiRequest>(d));
}

export async function saveRequest(request: ApiRequest): Promise<ApiRequest> {
  const { id, createdAt, updatedAt, ...data } = request;
  const clientId = id || generateId();

  const existing = await RequestModel.findOne(clientOrMongoIdFilter(clientId));

  let doc;
  if (existing) {
    doc = await RequestModel.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...data, clientId, updatedAt: new Date().toISOString() } },
      { new: true }
    );
  } else {
    doc = await RequestModel.create({ ...data, clientId });
  }

  if (data.collectionId) {
    await CollectionModel.findOneAndUpdate(
      clientOrMongoIdFilter(data.collectionId),
      { $addToSet: { requestIds: clientId } }
    );
  }

  return toPlain<ApiRequest>(doc!);
}

export async function deleteRequest(id: string): Promise<boolean> {
  const result = await RequestModel.findOneAndDelete(clientOrMongoIdFilter(id));
  return !!result;
}

export async function createRequestInCollection(
  collectionId: string,
  folderId?: string,
  name = 'New Request'
): Promise<ApiRequest> {
  const request = createDefaultRequest(name);
  request.collectionId = collectionId;
  request.folderId = folderId;
  return saveRequest(request);
}

// --- History Repository ---

export async function addHistoryEntry(entry: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry> {
  const settings = await getSettings();
  const doc = await HistoryModel.create(entry);

  const count = await HistoryModel.countDocuments();
  if (count > settings.maxHistorySize) {
    const excess = count - settings.maxHistorySize;
    const oldest = await HistoryModel.find().sort({ timestamp: 1 }).limit(excess).select('_id');
    await HistoryModel.deleteMany({ _id: { $in: oldest.map((o) => o._id) } });
  }

  return toPlain<HistoryEntry>(doc);
}

export async function getHistory(
  page = 1,
  pageSize = 50,
  search = ''
): Promise<PaginatedResult<HistoryEntry>> {
  const filter = search
    ? { $text: { $search: search } }
    : {};

  const query = search
    ? HistoryModel.find({ $or: [{ url: { $regex: search, $options: 'i' } }, { method: { $regex: search, $options: 'i' } }] })
    : HistoryModel.find(filter);

  const total = await query.clone().countDocuments();
  const items = await query
    .sort({ timestamp: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    items: items.map((d) => toPlain<HistoryEntry>(d)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function deleteHistoryEntry(id: string): Promise<boolean> {
  const result = await HistoryModel.findByIdAndDelete(id);
  return !!result;
}

export async function clearHistory(): Promise<number> {
  const result = await HistoryModel.deleteMany({});
  return result.deletedCount;
}

// --- Environment Repository ---

export async function getEnvironments(): Promise<Environment[]> {
  const docs = await EnvironmentModel.find().sort({ name: 1 }).lean();
  return docs.map((d) => toPlain<Environment>(d));
}

export async function createEnvironment(name: string): Promise<Environment> {
  const doc = await EnvironmentModel.create({
    name,
    variables: [],
    isDefault: false,
  });
  return toPlain<Environment>(doc);
}

export async function updateEnvironment(
  id: string,
  updates: Partial<Pick<Environment, 'name' | 'variables' | 'isDefault'>>
): Promise<Environment | null> {
  if (updates.isDefault) {
    await EnvironmentModel.updateMany({}, { $set: { isDefault: false } });
  }
  const doc = await EnvironmentModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
  return doc ? toPlain<Environment>(doc) : null;
}

export async function deleteEnvironment(id: string): Promise<boolean> {
  const result = await EnvironmentModel.findByIdAndDelete(id);
  return !!result;
}

// --- Request Tabs Repository ---

export async function getOpenTabs(): Promise<{ tabId: string; requestId: string; order: number }[]> {
  const docs = await RequestTabModel.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    tabId: String(d._id),
    requestId: d.requestId,
    order: d.order,
  }));
}

export async function saveOpenTabs(
  tabs: { requestId: string; order: number }[]
): Promise<void> {
  await RequestTabModel.deleteMany({});
  if (tabs.length > 0) {
    await RequestTabModel.insertMany(tabs);
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
