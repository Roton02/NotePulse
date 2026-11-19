import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userControllers } from "./user.controller";
import { UserRole } from "./user.interface";
import { UserValidation } from "./user.validation";

const router = express.Router();

// Every user-management route is admin only
router.use(auth(UserRole.ADMIN));

router.get("/", userControllers.getAllUsers);
// Declared before "/:id" so "interests" is not read as a user ID
router.get("/interests", userControllers.groupByInterests);
router.post("/", validateRequest(UserValidation.createUserSchema), userControllers.createUser);
router.get("/:id", userControllers.getUserById);
router.patch("/:id", validateRequest(UserValidation.updateUserSchema), userControllers.updateUser);
router.delete("/:id", userControllers.deleteUser);

export const userRoutes = router;
