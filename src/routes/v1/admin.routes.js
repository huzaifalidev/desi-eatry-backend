import express from "express";
import {
  signin,
  fetchAdmin,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  signup,
} from "../../controllers/admin.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// ----------------- Admin Authentication -----------------
router.post("/signin", signin);
router.post("/signup", signup);

// Refresh token should NOT require verifyAdmin middleware
router.post("/refresh-token", refreshToken);

// Logout and profile require valid access token
router.post("/logout", verifyAdmin(), logout);
router.get("/me", verifyAdmin(), fetchAdmin);

// ----------------- Password Management -----------------
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
