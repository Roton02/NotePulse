import express from "express";

const router = express.Router();

// Feature modules are registered here as they are built, e.g.:
// { path: "/auth", route: authRoute }
const moduleRoutes: { path: string; route: express.Router }[] = [];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
