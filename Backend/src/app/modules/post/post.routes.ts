import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { postControllers } from "./post.controller";
import { PostValidation } from "./post.validation";

const router = express.Router();

// Posts are public: anyone can read the feed or a user's posts
router.get("/", postControllers.getAllPosts);
router.get("/user/:userId", postControllers.getPostsByUser);
// Writing a post needs a logged-in user
router.post("/", auth(), validateRequest(PostValidation.createPostSchema), postControllers.createPost);

export const postRoutes = router;
