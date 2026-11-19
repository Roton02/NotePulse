import express from "express";
import auth from "../../middlewares/auth";
import rateLimiter from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { authControllers } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

// Limits brute-force attempts: 20 requests per 15 minutes per IP
const authLimiter = rateLimiter(15, 20);

router.post(
  "/register",
  authLimiter,
  validateRequest(AuthValidation.registerSchema),
  authControllers.register
);
router.post(
  "/login",
  authLimiter,
  validateRequest(AuthValidation.loginSchema),
  authControllers.login
);
router.get("/me", auth(), authControllers.me);

export const authRoutes = router;
