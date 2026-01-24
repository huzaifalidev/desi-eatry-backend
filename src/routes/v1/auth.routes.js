import express from "express";
import {
  forgotPassword,
  loginUser,
  refreshToken,
  registerUser,
  resetPassword,
  userLogout,
  fetchUser,
} from "../../controllers/auth.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { rateLimiter } from "../../middlewares/rate.limiter.js";

const router = express.Router();

router.post("/register", registerUser, rateLimiter(10, 15, "Too many registration attempts, please try again later."));
router.post("/login", loginUser, rateLimiter(100, 150, "Too many login attempts, please try again later."));
router.post("/refresh-token", refreshToken);
router.post("/logout", verifyToken, userLogout);
router.post(
  "/forgot-password",
  rateLimiter(
    3,
    60,
    "Too many password reset attempts, please try again in 1 hour."
  ),
  forgotPassword
);
router.post("/reset-password", resetPassword);
router.get("/me", verifyToken, fetchUser);
export default router;