import { model, Schema } from "mongoose";
import { INote } from "./note.interface";

const noteSchema = new Schema<INote>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      default: "",
      maxlength: 10000,
    },
  },
  { timestamps: true }
);

// A user's own notes, newest first (filter by owner, sort by createdAt)
noteSchema.index({ owner: 1, createdAt: -1 });
// Admin list of all notes, newest first
noteSchema.index({ createdAt: -1 });

export const Note = model<INote>("Note", noteSchema);
