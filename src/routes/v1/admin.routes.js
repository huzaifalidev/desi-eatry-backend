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

// Admin authentication
router.post("/signin", signin);
router.post("/signup", signup);
router.post("/refresh-token",verifyAdmin("refresh"), refreshToken);
router.post("/logout", verifyAdmin(), logout);

// Admin profile
router.get("/me", verifyAdmin(), fetchAdmin);
// Password management
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
