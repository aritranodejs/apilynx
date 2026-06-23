import mongoose from 'mongoose';

/** True only for 24-char hex MongoDB ObjectId strings (not UUIDs). */
export function isMongoObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

/** Query by clientId, or clientId + _id when id is a valid ObjectId. */
export function clientOrMongoIdFilter(
  id: string
): { clientId: string } | { $or: [{ clientId: string }, { _id: string }] } {
  if (isMongoObjectId(id)) {
    return { $or: [{ clientId: id }, { _id: id }] };
  }
  return { clientId: id };
}

/** Validate and return ObjectId for internal _id lookups, or null. */
export function toMongoObjectId(id: string): mongoose.Types.ObjectId | null {
  if (!isMongoObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
}
