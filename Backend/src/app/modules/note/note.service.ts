import httpStatus from "http-status";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { buildMeta, getPagination } from "../../../shared/pagination";
import { UserRole } from "../user/user.interface";
import { INote } from "./note.interface";
import { Note } from "./note.model";

const createNote = async (ownerId: string, payload: Partial<INote>) => {
  // Only title and content are stored; the owner always comes from the token
  return await Note.create({
    owner: new Types.ObjectId(ownerId),
    title: payload.title,
    content: payload.content ?? "",
  });
};

const listOwnNotes = async (ownerId: string, query: { page?: unknown; limit?: unknown }) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { owner: new Types.ObjectId(ownerId) };

  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  return { notes, meta: buildMeta(page, limit, total) };
};

const listAllNotes = async (query: { page?: unknown; limit?: unknown }) => {
  const { page, limit, skip } = getPagination(query);

  const [notes, total] = await Promise.all([
    Note.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Note.countDocuments(),
  ]);

  return { notes, meta: buildMeta(page, limit, total) };
};

// Owner or admin can read a note. Anyone else gets 404, so note IDs cannot be probed.
const getNote = async (noteId: string, requester: { id: string; role: UserRole }) => {
  const note = await Note.findById(noteId);
  const isOwner = note && String(note.owner) === requester.id;
  const isAdmin = requester.role === UserRole.ADMIN;

  if (!note || (!isOwner && !isAdmin)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Note not found");
  }
  return note;
};

// Only the owner can change a note
const updateNote = async (noteId: string, ownerId: string, payload: Partial<INote>) => {
  const updates: Partial<INote> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.content !== undefined) updates.content = payload.content;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, owner: ownerId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, "Note not found");
  }
  return note;
};

// Only the owner can delete a note
const deleteNote = async (noteId: string, ownerId: string) => {
  const note = await Note.findOneAndDelete({ _id: noteId, owner: ownerId });
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, "Note not found");
  }
  return note;
};

export const noteServices = {
  createNote,
  listOwnNotes,
  listAllNotes,
  getNote,
  updateNote,
  deleteNote,
};
