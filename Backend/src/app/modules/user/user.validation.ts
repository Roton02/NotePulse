import { z } from "zod";
import { UserRole } from "./user.interface";
import { INTERESTS } from "./user.constants";

const createUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("A valid email is required")
    .max(254, "Email must be at most 254 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Role must be either user or admin" }),
  }).optional(),
  interests: z
    .array(
      z.enum(INTERESTS, {
        errorMap: () => ({ message: "Choose interests from the list" }),
      }),
      { invalid_type_error: "Interests must be a list" }
    )
    .max(INTERESTS.length, "Too many interests")
    .optional(),
});

// Every field is optional on update
const updateUserSchema = createUserSchema.partial();

export const UserValidation = {
  createUserSchema,
  updateUserSchema,
};
