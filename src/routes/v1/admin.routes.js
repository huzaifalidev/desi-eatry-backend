import express from "express";
import {
  signin,
  signup,
  fetchAdmin,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../../controllers/admin.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// ---------- AUTH ----------
router.post("/signin", signin);
router.post("/signup", signup);
router.post("/refresh-token", verifyAdmin("refresh"), refreshToken);
router.post("/logout", verifyAdmin(), logout);

// ---------- PROFILE ----------
router.get("/me", verifyAdmin(), fetchAdmin);

// ---------- PASSWORD ----------
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
