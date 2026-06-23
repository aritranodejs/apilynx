"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMongoObjectId = isMongoObjectId;
exports.clientOrMongoIdFilter = clientOrMongoIdFilter;
exports.toMongoObjectId = toMongoObjectId;
const mongoose_1 = __importDefault(require("mongoose"));
/** True only for 24-char hex MongoDB ObjectId strings (not UUIDs). */
function isMongoObjectId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
}
/** Query by clientId, or clientId + _id when id is a valid ObjectId. */
function clientOrMongoIdFilter(id) {
    if (isMongoObjectId(id)) {
        return { $or: [{ clientId: id }, { _id: id }] };
    }
    return { clientId: id };
}
/** Validate and return ObjectId for internal _id lookups, or null. */
function toMongoObjectId(id) {
    if (!isMongoObjectId(id))
        return null;
    return new mongoose_1.default.Types.ObjectId(id);
}
