import express from "express";
import {
  fetchAdmin,
  logout,
  signin,
} from "../../controllers/admin.controller.js";
import { refreshToken } from "../../controllers/auth.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";
const router = express.Router();
router.post("/signin", signin);
router.post("/get-admin", verifyAdmin, fetchAdmin);
router.post("/logout", verifyAdmin, logout);
router.post("/refresh-token", refreshToken);
export default router;