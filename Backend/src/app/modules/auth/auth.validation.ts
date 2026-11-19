import { z } from "zod";

const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("A valid email is required")
  .max(254, "Email must be at most 254 characters");

// Zod strips unknown keys, so a client cannot send "role" to make itself an admin
const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: emailSchema,
  // bcrypt only uses the first 72 bytes, so longer passwords are rejected
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  interests: z
    .array(z.string().trim().min(1).max(30), {
      invalid_type_error: "Interests must be an array of strings",
    })
    .max(20, "A user can have at most 20 interests")
    .optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const AuthValidation = {
  registerSchema,
  loginSchema,
};
