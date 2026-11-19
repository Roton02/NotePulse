import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { noteRoutes } from "../modules/note/note.routes";

const router = express.Router();

// Feature modules are registered here as they are built
const moduleRoutes: { path: string; route: express.Router }[] = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/notes", route: noteRoutes },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
