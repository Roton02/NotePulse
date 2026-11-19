import { z } from "zod";

const createPostSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  body: z
    .string({ required_error: "Body is required" })
    .trim()
    .min(1, "Body is required")
    .max(5000, "Body must be at most 5000 characters"),
});

export const PostValidation = {
  createPostSchema,
};
