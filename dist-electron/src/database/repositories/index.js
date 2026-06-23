"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.getCollections = getCollections;
exports.createCollection = createCollection;
exports.updateCollection = updateCollection;
exports.deleteCollection = deleteCollection;
exports.getRequest = getRequest;
exports.getRequestsByCollection = getRequestsByCollection;
exports.saveRequest = saveRequest;
exports.deleteRequest = deleteRequest;
exports.createRequestInCollection = createRequestInCollection;
exports.addHistoryEntry = addHistoryEntry;
exports.getHistory = getHistory;
exports.deleteHistoryEntry = deleteHistoryEntry;
exports.clearHistory = clearHistory;
exports.getEnvironments = getEnvironments;
exports.createEnvironment = createEnvironment;
exports.updateEnvironment = updateEnvironment;
exports.deleteEnvironment = deleteEnvironment;
exports.getOpenTabs = getOpenTabs;
exports.saveOpenTabs = saveOpenTabs;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models/index.js");
const utils_1 = require("../../lib/utils.js");
const mongo_id_1 = require("../../lib/mongo-id.js");
const DEFAULT_MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/reqforge';
let isConnected = false;
async function connectDatabase(uri = DEFAULT_MONGO_URI) {
    if (isConnected)
        return;
    await mongoose_1.default.connect(uri);
    isConnected = true;
    await seedDefaults();
}
async function seedDefaults() {
    const settingsCount = await models_1.SettingsModel.countDocuments();
    if (settingsCount === 0) {
        await models_1.SettingsModel.create({
            theme: 'dark',
            timeout: 30000,
            autoSave: true,
            maxHistorySize: 10000,
            sidebarCollapsed: false,
        });
    }
    const envCount = await models_1.EnvironmentModel.countDocuments();
    if (envCount === 0) {
        const defaults = ['Local', 'Development', 'Staging', 'Production'];
        for (let i = 0; i < defaults.length; i++) {
            await models_1.EnvironmentModel.create({
                name: defaults[i],
                isDefault: i === 0,
                variables: [
                    { id: (0, utils_1.generateId)(), key: 'BASE_URL', value: 'http://localhost:3000', enabled: true, secret: false },
                    { id: (0, utils_1.generateId)(), key: 'TOKEN', value: '', enabled: true, secret: true },
                    { id: (0, utils_1.generateId)(), key: 'USER_ID', value: '', enabled: true, secret: false },
                ],
            });
        }
    }
}
function toPlain(doc) {
    const obj = typeof doc.toObject === 'function'
        ? doc.toObject()
        : doc;
    const { _id, __v, clientId, ...rest } = obj;
    return { ...rest, id: clientId || String(_id) };
}
// --- Settings Repository ---
async function getSettings() {
    const doc = await models_1.SettingsModel.findOne().lean();
    if (!doc) {
        const created = await models_1.SettingsModel.create({});
        return toPlain(created.toObject());
    }
    return toPlain(doc);
}
async function updateSettings(updates) {
    const doc = await models_1.SettingsModel.findOneAndUpdate({}, { $set: updates }, { new: true, upsert: true });
    return toPlain(doc);
}
// --- Collection Repository ---
async function getCollections(projectId) {
    const filter = projectId ? { projectId } : {};
    const docs = await models_1.CollectionModel.find(filter).sort({ updatedAt: -1 }).lean();
    return docs.map((d) => toPlain(d));
}
async function createCollection(name, description, projectId, ownerId, teamId) {
    const doc = await models_1.CollectionModel.create({
        clientId: (0, utils_1.generateId)(),
        name,
        description,
        folders: [],
        requestIds: [],
        projectId,
        ownerId,
        teamId,
    });
    return toPlain(doc);
}
async function updateCollection(id, updates) {
    const doc = await models_1.CollectionModel.findOneAndUpdate((0, mongo_id_1.clientOrMongoIdFilter)(id), { $set: updates }, { new: true });
    return doc ? toPlain(doc) : null;
}
async function deleteCollection(id) {
    await models_1.RequestModel.deleteMany({ $or: [{ collectionId: id }] });
    const result = await models_1.CollectionModel.findOneAndDelete((0, mongo_id_1.clientOrMongoIdFilter)(id));
    return !!result;
}
// --- Request Repository ---
async function getRequest(id) {
    const doc = await models_1.RequestModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(id)).lean();
    return doc ? toPlain(doc) : null;
}
async function getRequestsByCollection(collectionId) {
    const docs = await models_1.RequestModel.find({ collectionId }).sort({ updatedAt: -1 }).lean();
    return docs.map((d) => toPlain(d));
}
async function saveRequest(request) {
    const { id, createdAt, updatedAt, ...data } = request;
    const clientId = id || (0, utils_1.generateId)();
    const existing = await models_1.RequestModel.findOne((0, mongo_id_1.clientOrMongoIdFilter)(clientId));
    let doc;
    if (existing) {
        doc = await models_1.RequestModel.findOneAndUpdate({ _id: existing._id }, { $set: { ...data, clientId, updatedAt: new Date().toISOString() } }, { new: true });
    }
    else {
        doc = await models_1.RequestModel.create({ ...data, clientId });
    }
    if (data.collectionId) {
        await models_1.CollectionModel.findOneAndUpdate((0, mongo_id_1.clientOrMongoIdFilter)(data.collectionId), { $addToSet: { requestIds: clientId } });
    }
    return toPlain(doc);
}
async function deleteRequest(id) {
    const result = await models_1.RequestModel.findOneAndDelete((0, mongo_id_1.clientOrMongoIdFilter)(id));
    return !!result;
}
async function createRequestInCollection(collectionId, folderId, name = 'New Request') {
    const request = (0, utils_1.createDefaultRequest)(name);
    request.collectionId = collectionId;
    request.folderId = folderId;
    return saveRequest(request);
}
// --- History Repository ---
async function addHistoryEntry(entry) {
    const settings = await getSettings();
    const doc = await models_1.HistoryModel.create(entry);
    const count = await models_1.HistoryModel.countDocuments();
    if (count > settings.maxHistorySize) {
        const excess = count - settings.maxHistorySize;
        const oldest = await models_1.HistoryModel.find().sort({ timestamp: 1 }).limit(excess).select('_id');
        await models_1.HistoryModel.deleteMany({ _id: { $in: oldest.map((o) => o._id) } });
    }
    return toPlain(doc);
}
async function getHistory(page = 1, pageSize = 50, search = '') {
    const filter = search
        ? { $text: { $search: search } }
        : {};
    const query = search
        ? models_1.HistoryModel.find({ $or: [{ url: { $regex: search, $options: 'i' } }, { method: { $regex: search, $options: 'i' } }] })
        : models_1.HistoryModel.find(filter);
    const total = await query.clone().countDocuments();
    const items = await query
        .sort({ timestamp: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
    return {
        items: items.map((d) => toPlain(d)),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
async function deleteHistoryEntry(id) {
    const result = await models_1.HistoryModel.findByIdAndDelete(id);
    return !!result;
}
async function clearHistory() {
    const result = await models_1.HistoryModel.deleteMany({});
    return result.deletedCount;
}
// --- Environment Repository ---
async function getEnvironments() {
    const docs = await models_1.EnvironmentModel.find().sort({ name: 1 }).lean();
    return docs.map((d) => toPlain(d));
}
async function createEnvironment(name) {
    const doc = await models_1.EnvironmentModel.create({
        name,
        variables: [],
        isDefault: false,
    });
    return toPlain(doc);
}
async function updateEnvironment(id, updates) {
    if (updates.isDefault) {
        await models_1.EnvironmentModel.updateMany({}, { $set: { isDefault: false } });
    }
    const doc = await models_1.EnvironmentModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return doc ? toPlain(doc) : null;
}
async function deleteEnvironment(id) {
    const result = await models_1.EnvironmentModel.findByIdAndDelete(id);
    return !!result;
}
// --- Request Tabs Repository ---
async function getOpenTabs() {
    const docs = await models_1.RequestTabModel.find().sort({ order: 1 }).lean();
    return docs.map((d) => ({
        tabId: String(d._id),
        requestId: d.requestId,
        order: d.order,
    }));
}
async function saveOpenTabs(tabs) {
    await models_1.RequestTabModel.deleteMany({});
    if (tabs.length > 0) {
        await models_1.RequestTabModel.insertMany(tabs);
    }
}
async function disconnectDatabase() {
    if (isConnected) {
        await mongoose_1.default.disconnect();
        isConnected = false;
    }
}
