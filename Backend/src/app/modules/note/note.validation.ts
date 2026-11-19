import { z } from "zod";

const createNoteSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  content: z
    .string({ invalid_type_error: "Content must be a string" })
    .max(10000, "Content must be at most 10000 characters")
    .optional(),
});

const updateNoteSchema = createNoteSchema.partial();

export const NoteValidation = {
  createNoteSchema,
  updateNoteSchema,
};
